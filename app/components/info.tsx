export default function Info() {
    return (
        <div className="info-area">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <h2 className="text-lg font-bold">Welcome to the CBTReach Promo page</h2>
                <h2 className="text-lg font-bold">All our workshops include:</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="mb-2">To browse and purchase from our catalogue of world class presenters and events individually, see below.</p>
                    <p className="mb-2">For instant access to individual events, please click the &apos;Access Event&apos; button, and use the paywall built into each event. For multiple purchases, please select your options below, and complete payment – we will endeavour to register you on your selections within 24 hours.</p>
                </div>
                <div>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>A CPD certificate of attendance upon completion</li>
                        <li>Any-time access for the life of the event</li>
                        <li>Full set of resources as provided by the presenter</li>
                        <li>Instant access (when purchased individually)</li>
                    </ul>
                    <div className="border-t pt-3 mt-3">
                        <p className="text-sm mb-2">
                            For multiple licences and Trust purchases, and technical help, please contact us directly to discuss your requirements and receive a bespoke quote.
                        </p>
                        <div className="text-right">
                            <a 
                                href="mailto:oli@globalpodium.com?subject=CBTReach%20-%20Multiple%20Licences%2C%20Trust%20Purchases%20%26%20Technical%20Help" 
                                className="select-all-button"
                                style={{ textDecoration: 'none' }}
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    );
}