import { TabType, TABS } from '../../../../driver/mot-reports/_types'

interface HeaderProps {
    showTabs?: boolean
    activeTab?: TabType
    onTabChange?: (tab: TabType) => void
    tabs?: readonly TabType[]
}

export default function Header({ showTabs = false, activeTab, onTabChange, tabs }: HeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">MOT Reports</h1>
            </div>

            {showTabs && tabs && activeTab && onTabChange && (
                <div className="bg-gray-100 p-1 rounded-full flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap ${
                                activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
