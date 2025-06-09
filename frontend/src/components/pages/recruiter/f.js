
import { useState } from 'react'

export default function Hahaha() {
  const [activeTab, setActiveTab] = useState('All')
  const [currentPage, setCurrentPage] = useState(3)
  
  const applicants = [
    {
      id: '#APL-0003',
      date: 'June 1, 2020, 08:22 AM',
      company: 'Moscicki Inc.',
      department: 'Creative Design Agency',
      type: 'FREELANCE',
      position: 'Intern UI Designer',
      status: 'Pending'
    },
    {
      id: '#APL-0002',
      date: 'June 1, 2020, 08:22 AM',
      company: 'Funk Inc.',
      department: 'IT Department',
      type: 'PART TIME',
      position: 'Junior UI Designer',
      status: 'On-Hold'
    },
    {
      id: '#APL-0003',
      date: 'June 1, 2020, 08:22 AM',
      company: 'Moscicki Inc.',
      department: 'Creative Design Agency',
      type: 'FREELANCE',
      position: 'Intern UI Designer',
      status: 'Pending'
    },
    {
      id: '#APL-0001',
      date: 'June 1, 2020, 08:22 AM',
      company: 'Highspeed Studios',
      department: 'Creative Design Agency',
      type: 'FULLTIME',
      position: 'Senior UX Designer',
      status: 'Candidate'
    },
    {
      id: '#APL-0002',
      date: 'June 1, 2020, 08:22 AM',
      company: 'Funk Inc.',
      department: 'IT Department',
      type: 'PART TIME',
      position: 'Junior UI Designer',
      status: 'On-Hold'
    },
    {
      id: '#APL-0001',
      date: 'June 1, 2020, 08:22 AM',
      company: 'Highspeed Studios',
      department: 'Creative Design Agency',
      type: 'FULLTIME',
      position: 'Senior UX Designer',
      status: 'Candidate'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-600'
      case 'On-Hold':
        return 'bg-orange-100 text-orange-600'
      case 'Candidate':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'FREELANCE':
        return 'bg-blue-50 text-blue-600'
      case 'PART TIME':
        return 'bg-purple-50 text-purple-600'
      case 'FULLTIME':
        return 'bg-green-50 text-green-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-800 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">J</span>
            </div>
            <span className="text-xl font-bold">Jobie</span>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-6 py-3 flex items-center space-x-3 text-purple-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            <span>Dashboard</span>
          </div>
          
          <div className="px-6 py-3 flex items-center space-x-3 text-purple-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
            <span>Search Job</span>
          </div>
          
          <div className="px-6 py-3 flex items-center space-x-3 bg-purple-700 rounded-r-full mr-4">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span className="text-white font-medium">Applications</span>
          </div>
          
          <div className="px-6 py-3 flex items-center space-x-3 text-purple-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            <span>Message</span>
          </div>
          
          <div className="px-6 py-3 flex items-center space-x-3 text-purple-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
            </svg>
            <span>Statistics</span>
          </div>
          
          <div className="px-6 py-3 flex items-center space-x-3 text-purple-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"></path>
            </svg>
            <span>News</span>
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-xs text-purple-300">
          <div>Jobie Job Portal Admin Dashboard</div>
          <div>© 2020 All Rights Reserved</div>
          <div className="mt-2 text-purple-200">Made with ❤️ by Webestica</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search something here..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a7 7 0 1114 0v8z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                </div>
                
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a7 7 0 1114 0v8z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">9</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <img className="w-8 h-8 rounded-full bg-gray-300" src="/api/placeholder/32/32" alt="Profile" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Oda Dink</div>
                    <div className="text-gray-500">Super Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            {/* Applications Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Showing 45 Applicants</h2>
                  <p className="text-sm text-gray-500">Based your preferences</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {['All', 'Pending', 'On-Hold', 'Candidate'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm">Newest</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applicants.map((applicant, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {applicant.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {applicant.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{applicant.company}</div>
                          <div className="text-sm text-gray-500">{applicant.department}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(applicant.type)}`}>
                          {applicant.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {applicant.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </button>
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                          {applicant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing 10 from 160 data
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                  ← Previous
                </button>
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
