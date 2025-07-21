import siimsLogo from '../images/siims_logo.svg'
import rowdySheet from '../images/rowdy_sheet.png'
import fireEmergency from '../images/fire_emergency.png'
import cidLogo from '../images/cid.png'

import background from '../images/background.png'

import { FiArrowRight } from 'react-icons/fi';

const Home = () => {
    const intelligence_cards = [
        { title: 'SIIMS', link: 'https://staging.raguva.in/siims/#/login' },
        { title: 'Snapshot', link: '' },
        { title: 'PMMC', link: 'https://pmmc.raguva.karnataka.gov.in/login' },
    ];

    const commissioner_cards = [
        { title: 'Rowdy Sheeter', link: 'https://rs.patterneffects.in/#/', image: rowdySheet },
        { title: 'Muddemal', link: 'https://muddemal.patterneffects.in/#/', image: rowdySheet  },
        { title: 'MOB', link: 'https://mob.patterneffects.in/#/', image: rowdySheet  },
        { title: 'BCP Chat', link: '', image: rowdySheet  },
        { title: 'NDPS APPLICATION', link: '', image: rowdySheet  },
        { title: 'Tapal Tracker', link: '', image: rowdySheet  },
        { title: 'Crime Analytics App', link: '', image: rowdySheet  },
    ];

    const fire_and_emergency_department_cards = [
        { title: 'DMS', link: 'https://fire-emergency.patterneffects.in/estorage/login/?next=/estorage/', image: fireEmergency },
        { title: 'Inventory Management', link: 'http://139.59.4.148/' },
    ];

    const lokayukta_cards = [
        { title: 'Lokayukta Digitalization (Investigation module)', link: 'https://lokayuktabeta.patterneffects.in/login.php' }
    ];

    const state_excise_cards = [
        { title: 'Dex-P', link: '' }
    ];

    const cid_cards = [
        { title: 'CMS (Case Management System)', link: 'http://onlinecms.net/', image: cidLogo }
    ];

    const renderSection = (title, cards) => (
        <div className="mb-10">
            <h4 className="text-xl font-bold text-gray-100 mb-4 uppercase">{title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                    <a
                        key={index}
                        href={card.link || '#'}
                        target={card.link ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="p-4 bg-white group border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between h-[130px]"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={card?.image || siimsLogo}
                                className="w-[36px] h-[36px] object-contain"
                                alt=""
                            />
                            <h2 className="text-md font-medium text-gray-800 group-hover:text-blue-700 transition line-clamp-2">
                                {card.title}
                            </h2>
                        </div>
                        <div className="mt-4 flex justify-end items-center">
                            <span className="text-md text-blue-600 group-hover:underline font-semibold">
                                View Application
                            </span>
                            <FiArrowRight className="text-blue-600 group-hover:text-blue-800 text-lg transition-transform group-hover:translate-x-1 mt-1" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );

    const divider = ()=>{
        return (
            <div className="flex justify-between items-center my-8">
                {[...Array(30)].map((_, idx) => (
                    <div key={idx} className="w-6 h-[2px] bg-gray-100 rounded" />
                ))}
            </div>
        )
    }

    return (
        <div className="relative min-h-screen">

            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${background})` }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />

            <div className="relative z-20 text-white">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2">
                        <img src={siimsLogo} className="w-[40px] h-[40px]" alt="logo" />
                        <h1 className="text-lg font-semibold text-gray-800 uppercase">
                            Police Application
                        </h1>
                    </div>
                </nav>

                <div className="px-6 py-10 max-w-6xl mx-auto">
                    {renderSection("Karnataka state intelligence department", intelligence_cards)}
                    {divider()}
                    
                    {renderSection("Commissioner of police", commissioner_cards)}
                    {divider()}
                    
                    {renderSection("Fire and Emergency department", fire_and_emergency_department_cards)}
                    {divider()}
                    
                    {renderSection("Lokayukta", lokayukta_cards)}
                    {divider()}
                    
                    {renderSection("State Excise Department Karnataka", state_excise_cards)}
                    {divider()}

                    {renderSection("CID (Criminal investigation department)", cid_cards)}
                </div>
            </div>

        </div>
    );
};

export default Home;
