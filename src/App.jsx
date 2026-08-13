import { useState } from "react";
import Nav from "./components/Nav";
import Intro from "./components/Intro";
import Hero from "./components/Hero";
import CategoryGallery from "./components/CategoryGallery";
import Bio from "./components/Bio";
import Contact from "./components/Contact";
import Lightbox from "./components/Lightbox";

function App() {
  const [activeProject, setActiveProject] = useState(null);

  return (
    <div id="top">
      <Nav />
      <Hero />
      {/* a beat between the reel and the work */}
      <Intro />
      <CategoryGallery onExpand={setActiveProject} />
      <Bio />
      <Contact />
      <Lightbox project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  );
}

export default App;
