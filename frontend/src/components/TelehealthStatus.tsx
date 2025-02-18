import { Checkmark, XMark } from './Icons';

interface TelehealthStatusProps {
  isAvailable: boolean;
}

const TelehealthStatus = ({ isAvailable }: TelehealthStatusProps) => {
  return (
    <div className="flex items-center gap-2">
      {isAvailable ? (
        <>
          <Checkmark className="text-[#466421]" />
          <span>Available Online</span>
        </>
      ) : (
        <>
          <XMark className="text-[#CF3400]" />
          <span>In-Person Only</span>
        </>
      )}
    </div>
  );
};

export default TelehealthStatus;
