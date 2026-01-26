import HeroBanner from "../components/home/Herobanner";
import ListeMaisons from "../components/home/ListeMaison";
import QualitesSection from "../components/home/QualiteSection";
import Services from "../components/home/Services";
const HomePage=()=>{
    return(
        <>
            <HeroBanner/>
            <ListeMaisons/>
            <QualitesSection/>
            <Services/>

        </>
    )
}
export default HomePage