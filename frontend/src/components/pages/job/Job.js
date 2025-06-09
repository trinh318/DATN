import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCode, faNewspaper } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { isAuth, userType } from "../../../libs/isAuth"; // Import các hàm kiểm tra
import "../../../styles/blog.css";

export default function Jobs() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate(); // Hook điều hướng

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handlePanelMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handlePanelMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Hàm kiểm tra và điều hướng
  const handleJobRecommendationClick = () => {
    if (!isAuth()) {
      // Nếu chưa đăng nhập
      navigate("/sign-in");
    } else if (userType() === "applicant") {
      // Nếu là applicant
      navigate("/jobs/job-recommendation");
    } else {
      // Nếu đã đăng nhập nhưng không phải applicant
      navigate("/sign-in");
    }
  };

  // Hàm kiểm tra và điều hướng
  const handleJobSavedClick = () => {
    if (!isAuth()) {
      // Nếu chưa đăng nhập
      navigate("/sign-in");
    } else if (userType() === "applicant") {
      // Nếu là applicant
      navigate("/jobs/job-saved");
    } else {
      // Nếu đã đăng nhập nhưng không phải applicant
      navigate("/sign-in");
    }
  };

  return (
    <div>
      <Popover className="popover">
        <>
          <Popover.Button
            className="popover-button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link className="nav-link" to="/jobs">
              <span className="span">Jobs</span>
            </Link>
            <FontAwesomeIcon
              className={`popover-icon ${isOpen ? "transform rotate-180" : ""}`}
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
              className={`popover-panel ${isOpen ? "show" : ""}`}
              onMouseEnter={handlePanelMouseEnter}
              onMouseLeave={handlePanelMouseLeave}
            >
              <div className="popover-inner">
                <Link to="/jobs/bestjobs" className="link">
                  <div className="icon">
                    <FontAwesomeIcon icon={faNewspaper} />
                  </div>
                  <div className="text">
                    <p className="text-md">Best Jobs</p>
                  </div>
                </Link>
                {/*<Link to="/jobs/findjobs" className="link">
                  <div className="icon">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text">
                    <p className="text-md">Find Jobs</p>
                  </div>
                </Link>*/}
                <div className="link" onClick={handleJobRecommendationClick}>
                  <div className="icon">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text">
                    <p className="text-md">Job Recommendation</p>
                  </div>
                </div>
                {/*
                <div className="link" onClick={handleJobSavedClick}>
                  <div className="icon">
                    <FontAwesomeIcon icon={faCode} />
                  </div>
                  <div className="text">
                    <p className="text-md">Job Saved</p>
                  </div>
                </div> */}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      </Popover>
    </div>
  );
}
