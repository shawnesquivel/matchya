// Primary-.js
const PrimaryBtn = ({ text, onClick, className }) => {
  const defaultStyle =
    "px-4 py-2 text-mblack text-base rounded-full leading-none font-medium border h-11 w-fit";
  const hoverStyle = "";

  const combinedClassName = `${defaultStyle} ${className} ${hoverStyle}`;

  return (
    <button onClick={onClick} className={combinedClassName}>
      {text}
    </button>
  );
};

export default PrimaryBtn;
