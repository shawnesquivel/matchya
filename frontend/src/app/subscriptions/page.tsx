import StripeSubscriptions from "../components/StripeSubscriptions";
import CustomerPortalBtn from "../components/CustomerPortalBtn";
const StripSubscriptionsPage = () => {
  return (
    <>
      <StripeSubscriptions userId="user_12345" />
      <CustomerPortalBtn />
    </>
  );
};

export default StripSubscriptionsPage;
