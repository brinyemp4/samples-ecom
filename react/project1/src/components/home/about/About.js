import { useState } from "react";
import { FaDownload } from "react-icons/fa";

import { about_me } from "../../../resources/options/images";

const About = (noBackground) => {
  const [skillsList] = useState([
    {
      label: "PHOTOSHOP & Illustator",
      percentile: 90,
    },
    {
      label: "HTML & CSS",
      percentile: 80,
    },
    {
      label: "JAVASCRIPT",
      percentile: 70,
    },
    {
      label: "WORDPRESS",
      percentile: 80,
    },
    {
      label: "DRUPAL & JOOMLA",
      percentile: 60,
    },
    {
      label: "LOGO DESIGN",
      percentile: 90,
    },
    {
      label: "BRANDING",
      percentile: 80,
    },
    {
      label: "PHOTOGRAPHY",
      percentile: 70,
    },
    {
      label: "UI & UX",
      percentile: 80,
    },
    {
      label: "CREATIVITY",
      percentile: 90,
    },
  ]);
  const mid = Math.ceil(skillsList.length / 2);
  const skills = {
    left: skillsList.slice(0, mid),
    right: skillsList.slice(mid),
  };
  return (
    <>
      {/* about us start*/}
      <section className={noBackground ? "" : `about_us_sec`} id="about">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="about_content">
                <h1>
                  About <span>Me?</span>
                </h1>
                <h2>Hello! I am alexis willam</h2>
                <h3>Web Designer & Developer</h3>
                <p>
                  Lorem ipsum dolor sit amet, consetetur sadipcing elitr,sed
                  dilam nonumy eirmod tempor invidunt ut labore et dolore magna
                  aliquyam erat, sed dilam voluptua. At vero eos et accusam et
                  justo duo dolores et ea rebum. Stet clita kasd gubergren no
                  sea takimata sanctus est. Lorem ipsum dolor sit amet.
                </p>
                <div className="row">
                  <div className="col-md-12">
                    <div className="btn download-cv-btn">
                      DOWNLOAD CV
                      <FaDownload />
                    </div>
                  </div>
                </div>
                <h4>Look over my skill level below</h4>
                <p>
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                  diam nonumy eirmod tempor invidunt ut labore et dolore magna
                  aliquyam.
                </p>
              </div>
              {/* about_content */}
            </div>
            <div className="col-md-6">
              <img
                src={about_me}
                alt="About Me"
                title="About Me"
                className="img-fluid w-75"
                data-aos="zoom-in"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <ul className="skill-wrapper">
                {skills.left.map((item, index) => (
                  <li key={`left-${index}`} data-aos="fade-right">
                    <div>
                      {item.label}
                      <span className="float-right">{item.percentile}%</span>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: item.percentile + "%" }}
                          aria-valuenow={item.percentile}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          &nbsp;
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="skill-wrapper">
                {skills.right.map((item, index) => (
                  <li key={`right-${index}`} data-aos="fade-left">
                    <div>
                      {item.label}
                      <span>{item.percentile}%</span>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: item.percentile + "%" }}
                          aria-valuenow={item.percentile}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          &nbsp;
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* container */}
      </section>
      {/* about us end */}
    </>
  );
};

export default About;
