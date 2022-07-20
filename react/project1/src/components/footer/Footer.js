import {
  FaFacebookF,
  FaPinterest,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <>
      {/* footer section start*/}
      <section className={`footer_x_widger`} id="contact">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h1>
                Contact <span>with Me</span>
              </h1>
              <div className="footer_social">
                <div className="row">
                  <div className="col-mod-3">
                    <span className="footer_social_label">FOLLOW ME</span>
                  </div>
                  <div className="col-mod-4">
                    <ul>
                      <li>
                        <a href="/">
                          <FaFacebookF />
                        </a>
                      </li>
                      <li>
                        <a href="/">
                          <FaPinterest />
                        </a>
                      </li>
                      <li>
                        <a href="/">
                          <FaInstagram />
                        </a>
                      </li>
                      <li>
                        <a href="/">
                          <FaTwitter />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-5">&nbsp;</div>
                </div>
              </div>
              {/* footer_social */}

              <div className="widget widget_address">
                <h3>ADDRESS</h3>
                <p>69 QUEEN ST, LONDON, UNITED KINGDOM</p>
              </div>
              {/* widget_address */}

              <div className="widget widget_phone">
                <h3>PHONE</h3>
                <p>(+706)898-0751</p>
              </div>
              {/* widget_phone */}

              <div className="widget widget_email">
                <h3>EMAIL</h3>
                <p>alex@me.com</p>
              </div>
              {/* widget_phone */}
            </div>
            <div className="col-md-6">
              <form className="contact-form">
                <div className="row form-group">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email"
                    />
                  </div>
                </div>
                <div className="row form-group">
                  <div className="col-md-12">
                    <input
                      type="phone"
                      className="form-control"
                      placeholder="Phone"
                    />
                  </div>
                </div>
                <div className="row form-group">
                  <div className="col-md-12">
                    <textarea
                      className="form-control"
                      placeholder="Your Message"
                      rows={5}
                    ></textarea>
                  </div>
                </div>
                <div className="row form-group">
                  <div className="col-md-3">
                    <button className="btn form-control" type="submit">
                      MESSAGE
                    </button>
                  </div>
                  <div className="col-md-9">&nbsp;</div>
                </div>
              </form>
              {/* Contact form ends */}
            </div>
          </div>
        </div>
        {/* container */}
      </section>
      {/* footer widget */}
    </>
  );
};

export default Footer;
