export default function Info() {
    return (
        <div className="info-area">
            <h2 className="text-lg font-bold mb-3">Welcome to the CBTReach Promo page</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="mb-2">To browse and purchase from our catalogue of world class presenters and events individually, see below.</p>
                    <p className="mb-2">For instant access to individual events, please click the 'Access Event' button, and use the paywall built into each event. For multiple purchases, please select your options below, and complete payment – we will endeavour to register you on your selections within 24 hours.</p>
                    <p className="mb-2">For multiple purchases for teams, or any technical help, please <a href="mailto:oli@globalpodium.com?subject=Assistance%20with%20CBTReach%20Big%20Winter%20Sale%202026" className="text-blue-600 hover:text-blue-800 underline font-semibold">contact us</a></p>
                </div>
                <div>
                    <p className="font-semibold mb-2">All our workshops include:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>A CPD certificate of attendance upon completion</li>
                        <li>Any-time access for the lifetime of the event</li>
                        <li>Full set of resources as provided by the presenter</li>
                        <li>Instant access (when purchased individually)</li>
                    </ul>
                </div>
            </div>
        </div> 
    );
}