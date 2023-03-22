import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from 'axios';

const Paypal = () => {
    // const [{ isPending }] = usePayPalScriptReducer();
    const initialOptions = {
        "client-id": "AS34VNOhe5wGedg3E8MkZsWWIb7VoHE54CoLYrGbib8FeNFmAlrMUwgsIDPbYNIC48YPXN6Vl-9FMR7H",
        currency: "USD",
        intent: "capture",
        // "data-client-token": btoa("AS34VNOhe5wGedg3E8MkZsWWIb7VoHE54CoLYrGbib8FeNFmAlrMUwgsIDPbYNIC48YPXN6Vl-9FMR7H" + ':' + "EPa00U3-OJlqXifqGPFmVDSz5LXQmSO4KDoVGmqaLwgRpeMc5KkgdxTRj6Kw6yq3aCf_Tp8xg6MYiOuF")
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