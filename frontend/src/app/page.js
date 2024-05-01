import Gallery from "./components/Gallery";
import { pressStart2P, sourceCodePro, instrumentSans } from "./styles/fonts";

export default function Home() {
  return (
    <div className="w-11/12 m-auto flex-col my-6 ">
      {/* <h1 className={`text-center ${instrumentSans.className} mb-4`}>
        The Generative AI Masterclass
      </h1> */}
      <div className="flex flex-row justify-start ">
        <div className="flex flex-col items-start justify-center  text-gray-800 py-4 px-4 sm:px-6 lg:px-8 w-6/12">
          <h2
            className={`w-full text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-left ${pressStart2P.className}`}
          >
            Building the AI Apps of the Future
          </h2>
          <p
            className={`w-full mt-6 max-w-2xl text-center text-lg leading-7 sm:text-2xl sm:leading-9 sm:text-left lg:text-3xl ${instrumentSans.className}`}
          >
            <span className="font-bold">
              Throughout this course, you'll be building stunning AI projects.
            </span>
          </p>
          <p
            className={`w-full mt-6 max-w-2xl text-center text-lg leading-7 sm:text-2xl sm:leading-9 sm:text-left lg:text-3xl ${instrumentSans.className}`}
          >
            You'l learn how to build personalized chatbots trained on your data.
            You'll also build AI agents, capable of navigating through any
            complex workflow.
          </p>
        </div>
        <Gallery />
      </div>
      <p
        className={`w-full mt-4 text-center text-10 leading-7 sm:text-2xl sm:leading-9 sm:text-center lg:text-3xl ${sourceCodePro.className}`}
      >
        This journey is yours. So{" "}
        <strong>roll up your sleeves, and let's start building!</strong>
      </p>
    </div>
  );
}
