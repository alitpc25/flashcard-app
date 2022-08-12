import React, {useRef} from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify";

function Header(props) {

  const { currentUserId } = props;

  const logOut = () => {
    localStorage.clear();
    toast.info('Logging out!', {
      position: "top-right",
      autoClose: 300,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    const timer = setTimeout(() => {
      window.location.reload("/");
    }, 500);
    return () => clearTimeout(timer);
  }

  const navButton = useRef(null);
  const linksContainerRef = useRef(null);

  function collapseNav() {
    navButton.current.classList.add("collapsed");
    linksContainerRef.current.classList.remove("show");
  }

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 1 }}>
      <nav className="navbar navbar-expand-md bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand text-light" to="/">Vocabuilder</Link>
          <button ref={navButton} className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div ref={linksContainerRef} className="collapse navbar-collapse flex-row-reverse" id="navbarNav">
            <ul className="navbar-nav d-flex">
              <li className="nav-item">
                {currentUserId ? <Link onClick={() => collapseNav()} className="nav-link active text-light" to={"/chat?userId=" + currentUserId}>Chat</Link> : null}
              </li>
              <li className="nav-item">
                {currentUserId ? <Link onClick={() => collapseNav()} className="nav-link active text-light" to={"/profile?userId=" + currentUserId}>Profile</Link> : null}
              </li>
              <li className="nav-item">
                {currentUserId ? <Link onClick={() => collapseNav()} className="nav-link active text-light" to="/words">Words</Link> : null}
              </li>
              <li className="nav-item">
                {currentUserId ? <Link onClick={() => collapseNav()} className="nav-link active text-light" to="/practice">Practice</Link> : null}
              </li>
              <li className="nav-item">
                {currentUserId ? <Link onClick={() => collapseNav()} className="nav-link active text-light" to="/leaderboard">Leaderboard</Link> : null}
              </li>
              <li className="nav-item ml-auto">
                {currentUserId ?
                  <Link className="nav-link active text-light" to="/" onClick={logOut}>Log Out</Link> :
                  <Link className="nav-link active text-light" to="/" onClick={() => collapseNav()}>Log In</Link>}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header