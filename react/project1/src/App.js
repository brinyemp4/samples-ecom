import { useEffect } from "react";
import "./index.scss";
import AOS from "aos";
import ScrollHandler from "./resources/scrollHandler";

// Home layout
import Home from "./home/Home";
import HomeTwo from "./home/HomeTwo";

import Error404 from "./blocks/Error404";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <Router basename={"/"}>
        <ScrollHandler>
          <Switch>
            <Route exact path={`${process.env.PUBLIC_URL}/`} component={Home} />
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/home-two`}
              component={HomeTwo}
            />
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/404`}
              component={Error404}
            />
            <Route component={Error404} />
          </Switch>
        </ScrollHandler>
      </Router>
    </>
  );
};

export default App;
