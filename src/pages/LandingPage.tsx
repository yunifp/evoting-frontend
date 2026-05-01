import { LandingNavbar } from '@/components/organisms/LandingNavbar';
import { LandingHero } from '@/components/organisms/LandingHero';
import { LandingFeatures } from '@/components/organisms/LandingFeatures';
import { LandingFooter } from '@/components/organisms/LandingFooter';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#12b3d6] selection:text-white scroll-smooth">
            <LandingNavbar />
            
            <main>
                <LandingHero />
                <LandingFeatures />
            </main>
            
            <LandingFooter />
        </div>
    );
}