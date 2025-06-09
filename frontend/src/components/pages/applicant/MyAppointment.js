import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import { FaStream } from 'react-icons/fa';

const MyAppointment = () => {
    const [appointments, setAppointments] = useState([]);

    const getDisplayStatus = (applicationStatus, interviewStatus) => {
        if (applicationStatus === "rejected") return "Hủy";
        if (interviewStatus === "available") return "Chưa xác nhận";
        if (interviewStatus === "Đang đợi phỏng vấn") return "Đang đợi phỏng vấn";
        if (interviewStatus === "cancle") return "Hủy";
        if (interviewStatus === "Hủy") return "Hủy cuộc phỏng vấn";
        if (interviewStatus === "Chờ phê duyệt") return "Chờ phê duyệt";
        if (interviewStatus === "Đã phỏng vấn") return "Đã phỏng vấn";
        return "Chưa xác nhận";
    };

    const fetchAppointments = async () => {
        try {
            const userId = getId(); // Ensure this function correctly retrieves a valid user ID
            console.log(userId)
            if (!userId) {
                console.error('User ID is missing');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/interviewschedule/available-times?userId=${userId}`);
            setAppointments(response.data); // Set fetched appointments into state
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        }
    };

    // Fetch appointments when the component mounts
    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleConfirm = async (jobIndex, timeIndex) => {
        const appointment = appointments[jobIndex]; // Lấy appointment tương ứng
        const job_id = appointment._id;
        const user_id = getId();

        const newTimeStatuses = appointment.availableTimes.map((time, tIndex) => {
            return {
                jobId: appointment._id,
                candidateId: getId(),
                idTime: time.idTime,
                status: tIndex === timeIndex ? "Chờ phê duyệt" : "cancle", // Đặt "Chờ phê duyệt" cho thời gian đã chọn, còn lại là "cancle"
            };
        });

        try {
            const response = await axios.put('http://localhost:5000/api/interviewschedule/update-schedules', {
                user_id: user_id,
                job_id: job_id,
                schedules: newTimeStatuses
            });
            console.log('Update response:', response.data);
            alert('Xác nhận lịch phỏng vấn thành công. Hãy đợi nhà tuyển dụng phê duyệt!');
            await fetchAppointments();
        } catch (error) {
            console.error('Error updating schedules:', error);
            alert('Failed to update schedules. Please try again.');
        }
    };

    return (
        <>
            <div className="flex flex-col gap-5 w-full">
                <div className='flex gap-5 pb-3'>
                    <FaStream className="w-3 text-gray-700" />
                    <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Appointment Schedules</p>
                </div>
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow">
                        {/* Applications Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">Showing All Your Applicants</h2>
                                    <p className="text-sm text-gray-500">Based your preferences</p>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="sticky top-0 left-0 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                        <th className="sticky top-0 left-0 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="sticky top-0 left-0 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">location</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.length > 0 ? (
                                        appointments.map((appointment, index) => {
                                            const timeList = appointment.availableTimes.length > 0 ? appointment.availableTimes : [{ isPlaceholder: true }];
                                            return timeList.map((time, timeIndex) => {
                                                const displayStatus = getDisplayStatus(appointment.applicationStatus, time.status); // ✅ Move here
                                                return (
                                                    <tr key={`${index}-${timeIndex}`}>
                                                        {timeIndex === 0 && (
                                                            <>
                                                                <td rowSpan={timeList.length} className="px-6 py-4 whitespace-nowrap">
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{appointment.jobName}</div>
                                                                        <div className="text-sm text-gray-500">{appointment.interview_location || ""}</div>
                                                                    </div>
                                                                </td>
                                                                <td rowSpan={timeList.length} className="px-6 py-4 whitespace-nowrap">
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{appointment.companyName}</div>
                                                                        <div className="text-sm text-gray-500">{appointment.companyIndustry || ""}</div>
                                                                    </div>
                                                                </td>
                                                                <td rowSpan={timeList.length} className="px-6 py-4 whitespace-nowrap text-center">
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
                                                            </>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="inline-flex px-2 py-1 text-xs font-medium rounded-full items-center">
                                                                {time?.isPlaceholder
                                                                    ? (
                                                                        <div className="text-gray-400 italic">Chưa có lịch</div>
                                                                    )
                                                                    : (
                                                                        <>
                                                                            {new Date(time.time).toLocaleString()}
                                                                            {displayStatus === "Chưa xác nhận" && (
                                                                                <button onClick={() => handleConfirm(index, timeIndex)} className="ml-4 py-1 px-3 rounded-full border border-blue-600 text-blue-600 hover:cursor-point text-sm">
                                                                                    Xác nhận
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <div className="inline-flex px-2 py-1 text-xs font-medium rounded-full items-center">
                                                                {time?.isPlaceholder
                                                                    ? <div className="text-gray-400 italic">Chưa có địa điểm</div>
                                                                    : (time.location || "")
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full items-center
                                                            ${displayStatus === 'Hủy' ? 'text-red-600' :
                                                                    displayStatus === 'Đã gửi lịch phỏng vấn' ? 'text-blue-600' :
                                                                        displayStatus === 'Đang đợi phỏng vấn' ? 'text-yellow-600' :
                                                                            displayStatus === 'Đã phỏng vấn' ? 'text-green-600' :
                                                                                displayStatus === 'Chờ phê duyệt' ? 'text-purple-600' :
                                                                                    'text-gray-500'}`}>
                                                                {displayStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            });
                                        })

                                    ) : (
                                        <>Không có lịch hẹn nào.</>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyAppointment;
