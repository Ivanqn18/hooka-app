import StashTab from '../components/StashTab';
import { Package } from 'lucide-react';

export default function StashPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 animate-reveal-up">
            <header className="mb-10 text-center px-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-shisha-ember/10 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 md:mb-6 text-shisha-ember border border-shisha-ember/20 shadow-xl">
                    <Package className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Mi <span className="text-shisha-ember">Almacén</span></h1>
                <p className="text-sm md:text-base text-shisha-text-muted font-medium px-4">Gestiona tu colección de tabacos y lista de deseos</p>
            </header>

            <div className="px-4 md:px-0">
                <StashTab />
            </div>
        </div>
    );
}
