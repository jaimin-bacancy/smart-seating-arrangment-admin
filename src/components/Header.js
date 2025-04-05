import { Link } from "react-router"
import { LOGO } from "../utils/constants"

const Header = () => {
    return (
        <div className="header">
            <div className="logo-container">
                <img className="logo" src={LOGO} alt="logo" />
            </div>
            <div className="nav-items">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/contact">Contact</Link>
                    </li>
                    <li>
                        <Link to="/cart">Cart</Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Header