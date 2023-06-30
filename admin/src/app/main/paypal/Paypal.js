import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from 'axios';

const Paypal = () => {
    // const [{ isPending }] = usePayPalScriptReducer();
    const initialOptions = {
        "client-id": "AevkQd7_MKUI6mSpcLXyL0MXYwxY_Y5vy8-fQG4IowQuHRXwk9dXQnqm7wqlfPAx2MkcFeuJwlcKl6-6",
        currency: "USD",
        intent: "capture",
        // "data-client-token": btoa("AevkQd7_MKUI6mSpcLXyL0MXYwxY_Y5vy8-fQG4IowQuHRXwk9dXQnqm7wqlfPAx2MkcFeuJwlcKl6-6" + ':' + "EK-L43SaFqcrTtmRgABvcZHVUToVoHxMtOGeIBkk-TdWKDg4lirK-PZ7zcZq0F26LwiWDVPf4a4VLaBv")
    };

    return (
        <div id="paypal-container" className="border">
            <PayPalScriptProvider options={initialOptions}>
                {/* {isPending ? <div className="spinner" /> : null} */}
                <PayPalButtons style={{ layout: "horizontal" }} />
            </PayPalScriptProvider>
        </div>
    )
}

export default Paypal;