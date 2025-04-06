/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const OpenAI = require("openai");
const { onCall } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");

admin.initializeApp();
const db = admin.firestore();

const openaiKey = defineString("OPENAI_KEY");

/**
 * Flexible AI assistant for workspace management.
 * Allows admins, PMs, and DOEs to ask natural language questions about
 * workspace organization and get AI-powered recommendations.
 */
exports.workspaceAssistant = onCall(async (data, context) => {
  // Verify authentication
  const uid = context.auth?.uid;
  if (!uid) throw new Error("User must be authenticated.");

  // Get user data and verify permissions
  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) throw new Error("User not found");
  const user = userSnap.data();

  // Check if user has appropriate role
  const allowedRoles = ["admin", "pm", "doe"];
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      "Insufficient permissions. Admin, PM, or DOE role required."
    );
  }

  // Get user prompt
  const { prompt } = data;
  if (!prompt) throw new Error("Prompt is required");

  const openai = new OpenAI({ apiKey: openaiKey.value() });

  // Gather current workspace data based on user role and prompt
  const workspaceData = await gatherWorkspaceData(prompt, user);

  // Build system prompt
  const systemPrompt = `
You are an intelligent workspace assistant for a smart office environment.
You help optimize seating arrangements, floor planning, and event organization.

Your capabilities:
- Recommend optimal seating arrangements and relocations
- Suggest the best floors/zones for events
- Analyze workspace utilization
- Answer questions about the current office setup

Use the provided workspace data to give specific, detailed recommendations.
  `.trim();

  // Build user prompt with context
  const userPrompt = `
User: ${user.displayName} (${user.role} in ${user.department})
User Query: "${prompt}"

Workspace Data:
${JSON.stringify(workspaceData, null, 2)}

Based on the available data, provide a helpful response that directly addresses the query.
Include specific recommendations if the query is asking for them.
  `.trim();

  // OpenAI API call
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const response = completion.choices[0].message.content;

  // Log the interaction
  await db.collection("ai_queries").add({
    userId: uid,
    userRole: user.role,
    prompt,
    response,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { response };
});

/**
 * Gathers relevant workspace data based on the prompt and user
 */
async function gatherWorkspaceData(prompt, user) {
  const data = {
    office: {},
    seats: {},
    floors: [],
    zones: [],
  };

  // Basic prompt analysis to determine what data to fetch
  const promptLower = prompt.toLowerCase();

  // Always get basic office stats
  data.office = await getBasicOfficeStats();

  // Floor-related query
  if (
    promptLower.includes("floor") ||
    promptLower.includes("level") ||
    promptLower.includes("event")
  ) {
    data.floors = await getFloorsData();
  }

  // Seating-related query
  if (
    promptLower.includes("seat") ||
    promptLower.includes("desk") ||
    promptLower.includes("seating") ||
    promptLower.includes("relocate") ||
    promptLower.includes("move") ||
    promptLower.includes("arrangement")
  ) {
    data.seats = await getSeatingData();
  }

  // Department-related query
  if (
    promptLower.includes("department") ||
    promptLower.includes("team") ||
    user.role === "doe"
  ) {
    if (user.role === "doe") {
      // If user is DOE, get specific department data
      data.department = await getDepartmentData(user.department);
    } else {
      // Otherwise get summary of all departments
      data.departments = await getDepartmentsSummary();
    }
  }

  // Project-related query
  if (
    promptLower.includes("project") ||
    promptLower.includes("team") ||
    user.role === "pm"
  ) {
    if (user.role === "pm") {
      // If user is PM, get their managed projects
      data.projects = await getUserProjects(user.id);
    } else {
      // Otherwise get summary of active projects
      data.projects = await getProjectsSummary();
    }
  }

  // Zone-related query
  if (
    promptLower.includes("zone") ||
    promptLower.includes("area") ||
    promptLower.includes("section")
  ) {
    data.zones = await getZonesData();
  }

  return data;
}

/**
 * Gets basic office stats
 */
async function getBasicOfficeStats() {
  const stats = {
    totalEmployees: 0,
    totalSeats: 0,
    occupiedSeats: 0,
    utilizationRate: 0,
  };

  // Count employees
  const usersSnap = await db.collection("users").get();
  stats.totalEmployees = usersSnap.size;

  // Count seats and calculate utilization
  const seatsSnap = await db.collection("seats").get();
  stats.totalSeats = seatsSnap.size;
  stats.occupiedSeats = seatsSnap.docs.filter(
    (doc) => doc.data().status === "occupied"
  ).length;
  stats.utilizationRate =
    stats.totalSeats > 0 ? (stats.occupiedSeats / stats.totalSeats) * 100 : 0;

  return stats;
}

/**
 * Gets floors data
 */
async function getFloorsData() {
  const floorsSnap = await db.collection("floors").get();

  const floors = await Promise.all(
    floorsSnap.docs.map(async (doc) => {
      const floor = {
        id: doc.id,
        name: doc.data().name,
        level: doc.data().level,
        maxSeats: doc.data().maxSeats || 0,
      };

      // Get occupancy stats for this floor
      const seatsSnap = await db
        .collection("seats")
        .where("floorId", "==", db.doc(`floors/${doc.id}`))
        .get();

      floor.totalSeats = seatsSnap.size;
      floor.occupiedSeats = seatsSnap.docs.filter(
        (doc) => doc.data().status === "occupied"
      ).length;
      floor.utilizationRate =
        floor.totalSeats > 0
          ? (floor.occupiedSeats / floor.totalSeats) * 100
          : 0;

      return floor;
    })
  );

  return floors;
}

/**
 * Gets seating data
 */
async function getSeatingData() {
  const seatsSnap = await db.collection("seats").get();

  const stats = {
    total: seatsSnap.size,
    byStatus: {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
    },
    byFloor: {},
    byZone: {},
    availableSeats: [],
  };

  // Calculate stats
  for (const doc of seatsSnap.docs) {
    const seat = doc.data();

    // Count by status
    stats.byStatus[seat.status] = (stats.byStatus[seat.status] || 0) + 1;

    // Track by floor
    if (seat.floorId) {
      const floorId =
        typeof seat.floorId === "string" ? seat.floorId : seat.floorId.id;
      if (!stats.byFloor[floorId]) {
        stats.byFloor[floorId] = { total: 0, available: 0, occupied: 0 };
      }
      stats.byFloor[floorId].total++;
      stats.byFloor[floorId][seat.status]++;
    }

    // Track by zone
    if (seat.zoneId) {
      const zoneId =
        typeof seat.zoneId === "string" ? seat.zoneId : seat.zoneId.id;
      if (!stats.byZone[zoneId]) {
        stats.byZone[zoneId] = { total: 0, available: 0, occupied: 0 };
      }
      stats.byZone[zoneId].total++;
      stats.byZone[zoneId][seat.status]++;
    }

    // Keep track of available seats
    if (seat.status === "available") {
      stats.availableSeats.push({
        id: doc.id,
        label: seat.label,
        floorId: seat.floorId
          ? typeof seat.floorId === "string"
            ? seat.floorId
            : seat.floorId.id
          : null,
        floorName: seat.floorName,
        zoneId: seat.zoneId
          ? typeof seat.zoneId === "string"
            ? seat.zoneId
            : seat.zoneId.id
          : null,
        type: seat.type,
      });
    }
  }

  return stats;
}

/**
 * Gets department data
 */
async function getDepartmentData(departmentId) {
  // Get employees in department
  const employeesSnap = await db
    .collection("users")
    .where("department", "==", departmentId)
    .get();

  const department = {
    id: departmentId,
    employeeCount: employeesSnap.size,
    byRole: {},
    seatingByFloor: {},
    seatingByZone: {},
  };

  // Process employees
  for (const doc of employeesSnap.docs) {
    const employee = doc.data();

    // Count by role
    department.byRole[employee.role] =
      (department.byRole[employee.role] || 0) + 1;

    // Get their seat
    try {
      const seatSnap = await db
        .collection("seats")
        .where("assignedTo", "==", db.doc(`users/${doc.id}`))
        .limit(1)
        .get();

      if (!seatSnap.empty) {
        const seat = seatSnap.docs[0].data();

        // Track by floor
        if (seat.floorId) {
          const floorId =
            typeof seat.floorId === "string" ? seat.floorId : seat.floorId.id;
          department.seatingByFloor[floorId] =
            (department.seatingByFloor[floorId] || 0) + 1;
        }

        // Track by zone
        if (seat.zoneId) {
          const zoneId =
            typeof seat.zoneId === "string" ? seat.zoneId : seat.zoneId.id;
          department.seatingByZone[zoneId] =
            (department.seatingByZone[zoneId] || 0) + 1;
        }
      }
    } catch (error) {
      console.error(`Error fetching seat for user ${doc.id}:`, error);
    }
  }

  return department;
}

/**
 * Gets departments summary
 */
async function getDepartmentsSummary() {
  const usersSnap = await db.collection("users").get();

  const departments = {};

  for (const doc of usersSnap.docs) {
    const user = doc.data();
    if (user.department) {
      if (!departments[user.department]) {
        departments[user.department] = {
          count: 0,
          byRole: {},
        };
      }

      departments[user.department].count++;

      if (user.role) {
        departments[user.department].byRole[user.role] =
          (departments[user.department].byRole[user.role] || 0) + 1;
      }
    }
  }

  return departments;
}

/**
 * Gets projects managed by a user
 */
async function getUserProjects(userId) {
  const projectsSnap = await db
    .collection("projects")
    .where("projectManager", "==", db.doc(`users/${userId}`))
    .get();

  return Promise.all(
    projectsSnap.docs.map(async (doc) => {
      const project = {
        id: doc.id,
        name: doc.data().name,
        status: doc.data().status,
        teamSize: doc.data().teamMembers ? doc.data().teamMembers.length : 0,
        seatingDistribution: {
          byFloor: {},
          byZone: {},
        },
      };

      // Get team members' seating
      if (doc.data().teamMembers && doc.data().teamMembers.length > 0) {
        for (const memberRef of doc.data().teamMembers) {
          try {
            const seatSnap = await db
              .collection("seats")
              .where("assignedTo", "==", memberRef)
              .limit(1)
              .get();

            if (!seatSnap.empty) {
              const seat = seatSnap.docs[0].data();

              // Track by floor
              if (seat.floorId) {
                const floorId =
                  typeof seat.floorId === "string"
                    ? seat.floorId
                    : seat.floorId.id;
                project.seatingDistribution.byFloor[floorId] =
                  (project.seatingDistribution.byFloor[floorId] || 0) + 1;
              }

              // Track by zone
              if (seat.zoneId) {
                const zoneId =
                  typeof seat.zoneId === "string"
                    ? seat.zoneId
                    : seat.zoneId.id;
                project.seatingDistribution.byZone[zoneId] =
                  (project.seatingDistribution.byZone[zoneId] || 0) + 1;
              }
            }
          } catch (error) {
            console.error("Error fetching seat:", error);
          }
        }
      }

      return project;
    })
  );
}

/**
 * Gets summary of active projects
 */
async function getProjectsSummary() {
  const projectsSnap = await db
    .collection("projects")
    .where("status", "==", "active")
    .get();

  return projectsSnap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    teamSize: doc.data().teamMembers ? doc.data().teamMembers.length : 0,
    priority: doc.data().priority || 3,
  }));
}

/**
 * Gets zones data
 */
async function getZonesData() {
  const zonesSnap = await db.collection("zones").get();

  return Promise.all(
    zonesSnap.docs.map(async (doc) => {
      const zone = {
        id: doc.id,
        name: doc.data().name,
        type: doc.data().type,
        floorId: doc.data().floorId
          ? typeof doc.data().floorId === "string"
            ? doc.data().floorId
            : doc.data().floorId.id
          : null,
      };

      // Get seating stats
      const seatsSnap = await db
        .collection("seats")
        .where("zoneId", "==", db.doc(`zones/${doc.id}`))
        .get();

      zone.totalSeats = seatsSnap.size;
      zone.occupiedSeats = seatsSnap.docs.filter(
        (doc) => doc.data().status === "occupied"
      ).length;
      zone.availableSeats = seatsSnap.docs.filter(
        (doc) => doc.data().status === "available"
      ).length;

      return zone;
    })
  );
}

exports.createUser = functions.https.onRequest(async (req, res) => {
  // ✅ CORS handling
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send(""); // Preflight request
  }

  // ✅ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized. Missing token." });
    }

    const {
      email,
      password,
      displayName,
      role,
      department,
      employeeId,
      techSkills,
    } = req.body;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      displayName,
      email,
      role,
      department,
      employeeId,
      techSkills,
      currentProjects: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ uid: userRecord.uid });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return res.status(500).json({ error: error.message });
  }
});

// exports.createUser = functions.https.onCall(async (data, context) => {
//   // Optional: check if requester is admin
//   const callerUID = context.auth?.uid;
//   console.log("👤 Caller UID:", callerUID);
//   const caller = await admin.auth().getUser(callerUID);
//   if (!caller?.customClaims?.admin) {
//     throw new functions.https.HttpsError(
//       "permission-denied",
//       "Only admins can create users."
//     );
//   }

//   const {
//     email,
//     password,
//     displayName,
//     role,
//     department,
//     employeeId,
//     techSkills,
//   } = data;

//   // Create Firebase Auth user
//   const userRecord = await admin.auth().createUser({
//     email,
//     password,
//     displayName,
//   });

//     console.log("👤 User created:", userRecord);
//   // Create user document in Firestore
//   await admin.firestore().collection("users").doc(userRecord.uid).set({
//     displayName,
//     email,
//     role,
//     department,
//     employeeId,
//     techSkills,
//     currentProjects: [],
//     createdAt: admin.firestore.FieldValue.serverTimestamp(),
//   });

//   console.log("📂 User document created in Firestore:", {
//     uid: userRecord.uid,
//     displayName,
//   });
//   return {uid: userRecord.uid};
// });
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
