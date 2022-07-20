import { useState } from "react";
import SingleService from "./SingleService";
import Slider from "react-slick";

import { serviceSlick } from "../../../resources/options/settings";
import { service1 } from "../../../resources/options/images";

const Service = () => {
  const [serviceList] = useState([
    {
      name: "UI/UX Design",
      description:
        "Lorem ipsum dolor sit amet,no sea takimata sanctus est Lorem ipsum dolor sit amet,consetetur sadipscing elitr, At vero eos et accusam et justo duo dolores et ea rebum.",
      image: {
        path: service1,
      },
    },
    {
      name: "Photography",
      description:
        "Lorem ipsum dolor sit amet,no sea takimata sanctus est Lorem ipsum dolor sit amet,consetetur sadipscing elitr, At vero eos et accusam et justo duo dolores et ea rebum.",
      image: {
        path: service1,
      },
    },
    {
      name: "Drawing",
      description:
        "Lorem ipsum dolor sit amet,no sea takimata sanctus est Lorem ipsum dolor sit amet,consetetur sadipscing elitr, At vero eos et accusam et justo duo dolores et ea rebum.",
      image: {
        path: service1,
      },
    },
    {
      name: "Branding",
      description:
        "Lorem ipsum dolor sit amet,no sea takimata sanctus est Lorem ipsum dolor sit amet,consetetur sadipscing elitr, At vero eos et accusam et justo duo dolores et ea rebum.",
      image: {
        path: service1,
      },
    },
    {
      name: "Creativity",
      description:
        "Lorem ipsum dolor sit amet,no sea takimata sanctus est Lorem ipsum dolor sit amet,consetetur sadipscing elitr, At vero eos et accusam et justo duo dolores et ea rebum.",
      image: {
        path: service1,
      },
    },
  ]);

  return (
    <>
      {/* service start*/}
      <section className="service_sec" id="services">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="title text-center">
                <h3>
                  What <span>I do?</span>
                </h3>
              </div>
              {/* title */}
            </div>
            <div className="w-100"></div>
            <div className="col-md-12">
              <div className="grid">
                <Slider {...serviceSlick}>
                  {serviceList.map((item, index) => (
                    <SingleService item={item} key={index} />
                  ))}
                </Slider>
              </div>
            </div>
          </div>
        </div>
        {/* container */}
      </section>
      {/* service end*/}
    </>
  );
};

export default Service;
