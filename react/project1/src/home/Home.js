import Footer from "../components/footer/Footer";
import Banner from "../components/home/banner/Banner";
import About from "../components/home/about/About";
import Portfolio from "../components/home/portfolio/Portfolio";
import Service from "../components/home/service/Service";
import ProfileTimeline from "../components/home/action/ProfileTimeline";
import Testimonial from "../components/home/testimonials/Testimonial";
import RecentBlog from "../components/home/blog/RecentBlog";
import PageHelmet from "../components/common/Helmet";

const HomeOne = () => {
  return (
    <>
      {/* Page title area start  */}
      <PageHelmet pageTitle="Home" />
      {/* page title area end  */}

      {/* Banner area start  */}
      <Banner />
      {/* Banner area end  */}

      {/* About area start  */}
      <About />
      {/* About area end  */}

      {/* Portfolio area start  */}
      <Portfolio />
      {/* Portfolio area end  */}

      {/* Service area start  */}
      <Service />
      {/* Service area end  */}

      {/* ProfileTimeline area start  */}
      <ProfileTimeline />
      {/* ProfileTimeline area end  */}

      {/* Testimonial area start  */}
      <Testimonial />
      {/* Testimonial area end  */}

      {/* Recent Blog area start  */}
      <RecentBlog />
      {/* Recent Blog area end  */}

      {/* Footer area start  */}
      <Footer />
      {/* Footer area end  */}
    </>
  );
};

export default HomeOne;
