import Banner from "../../UI/Banner";
import BestJob from "../../UI/BestJob";
import BestCompany from "../../UI/BestCompany";

function HomePage() {
  return (
    <div className="App" to="/home-page">
      <Banner />
      <BestJob />
      <BestCompany />
    </div>
  );
}

export default HomePage;
