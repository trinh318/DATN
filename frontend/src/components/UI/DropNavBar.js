import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCode, faNewspaper, faBars } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import '../../styles/dropnavbar.css';
import Blog from "../pages/blog/Blog";
import Jobs from "../pages/job/Job";
import { isAuth, userType } from "../../libs/isAuth";


export default function DropNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // Điều chỉnh độ trễ này nếu cần
  };

  const handlePanelMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handlePanelMouseLeave = () => { 
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // Độ trễ tương tự cho bảng
  };

  return (
    <div>
      <Popover className="popover-nav">
        <>
          <Popover.Button
            className="popover-nav-button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link className="nav-link">
              <span className="span-nav">
                <FontAwesomeIcon icon={faBars} size="lg" />
              </span>
            </Link>
            <FontAwesomeIcon
              className={`popover-nav-icon ${isOpen ? "transform rotate-180-nav" : ""}`}
              icon={faChevronDown}
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            show={isOpen}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={`popover-nav-panel ${isOpen ? "show" : ""}`}
              onMouseEnter={handlePanelMouseEnter}
              onMouseLeave={handlePanelMouseLeave}
            >
              <div className="popover-nav-inner">
                <Link to="/recruiter-sign-in" className="link-nav">
                  <div className="icon-nav">
                    <FontAwesomeIcon icon={faNewspaper} />
                  </div>
                  <div className="text-nav">
                    <p className="text-md-nav">Nhà tuyển dụng</p>
                  </div>
                </Link>
                <Jobs className="link-nav">
                  <div className="icon-nav">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text-nav">
                    <p className="text-md-nav">Jobs</p>
                  </div>
                </Jobs>
                <Link to="/companies" className="link-nav">
                  <div className="icon-nav">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text-nav">
                    <p className="text-md-nav">Companies</p>
                  </div>
                </Link>
                <Link to="/leaderboard" className="link-nav">
                  <div className="icon-nav">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text-nav">
                    <p className="text-md-nav">Leaderboard</p>
                  </div>
                </Link>
                <Blog to="/blog-home" className="link-nav">
                  <div className="icon-nav">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text-nav">
                    <p className="text-md-nav">Blog</p>
                  </div>
                </Blog>
                {!isAuth() && (
                  <>
                    <Link to="/sign-in" className="link-nav">
                      <div className="icon-nav">
                        <FontAwesomeIcon icon={faCode} />
                      </div>
                      <div className="text-nav">
                        <p className="text-md-nav">Sign in</p>
                      </div>
                    </Link>
                    <Link to="/sign-up" className="link-nav">
                      <div className="icon-nav">
                        <FontAwesomeIcon icon={faCode} />
                      </div>
                      <div className="text-nav">
                        <p className="text-md-nav">Sign up</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      </Popover>
    </div>
  );
}
