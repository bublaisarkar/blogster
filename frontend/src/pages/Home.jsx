import FeaturedSlider from "../components/home/FeaturedSlider"
import HeroSlider from "../components/home/HeroSlider"
import LatestCategoriesPopular from "../components/home/LatestCategoriesPopular"

const Home = () => {
  return (
    <>
      <HeroSlider />
      <FeaturedSlider />
      <LatestCategoriesPopular />
    </>
  )
}

export default Home