import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return ( 
        <div className="footer-area">
            <Link 
                href="https://globalpodium.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
            >
                <p>&copy; {new Date().getFullYear()} GlobalPodium Ltd</p>
                <Image 
                    src="/GP globe.png"  
                    alt="GlobalPodium Logo" 
                    width={30} 
                    height={30} 
                    className="footer-logo" 
                />
            </Link> 
        </div>
    );
}