import Header from '@/components/UI/Header'
import { BookOpen } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getId } from '@/libs/isAuth';
import { Flag, Clock } from 'lucide-react'; // or from 'react-icons' if preferred
import clsx from 'clsx';
import { FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';

function TestPage() {
    const locations = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(locations.search);
    const testId = queryParams.get("testId");
    const jobId = queryParams.get("jobId");
console.log("id:", jobId, testId);
    const [testDetails, setTestDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('testHomePage');

    const handleTabClick = (tab) => {
        setActiveTab(tab);

        if (tab === 'doTestPage') {
            setHasStarted(true);
        }
    };

    const fetchTestDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/tests/edit/${testId}`);
            setTestDetails(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin bài kiểm tra:', error);
            alert('Không thể lấy thông tin bài kiểm tra');
        }
    };

    useEffect(() => {
        fetchTestDetails();
        console.log("detail", testDetails);
    }, [testId])

    const [answers, setAnswers] = useState([]);
    const [answered, setAnswered] = useState({});
    const [marked, setMarked] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);
    const [timeProgress, setTimeProgress] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);

    const handleAnswer = (qnIndex, selectedAnswer) => {
        setAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[qnIndex] = selectedAnswer;
            return updatedAnswers;
        });

        console.log("ans", answers)
    };

    const handleAnswerById = (questionId, selectedAnswer) => {
        setAnswered(prevAnswers => ({
            ...prevAnswers,
            [questionId]: selectedAnswer,
        }));
    };

    const toggleMark = (questionId) => {
        setMarked((prev) =>
            prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
        );
    };

    useEffect(() => {
        if (testDetails?.duration) {
            setTimeLeft(testDetails.duration * 60);
            setTotalDuration(testDetails.duration * 60);
        }
        if (testDetails?.questions?.length) {
            setTotalQuestions(testDetails.questions.length);
        }
    }, [testDetails]);

    useEffect(() => {
        if (totalDuration > 0) {
            setTimeProgress((timeLeft / totalDuration) * 100);
        }
    }, [timeLeft, totalDuration]);

    useEffect(() => {
        if (totalQuestions > 0) {
            setProgressPercent(Math.round((answeredCount / totalQuestions) * 100));
        }
    }, [answeredCount, totalQuestions]);

    useEffect(() => {
        setAnsweredCount(Object.keys(answered).length);
    }, [answered]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const calculateScore = () => {
        let score = 0;

        if (!testDetails?.questions) return 0;

        answers.forEach((selectedAnswer, index) => {
            const question = testDetails.questions[index];  // Get the question object
            if (question.correct_answer === selectedAnswer) {
                score += question.points;  // Add points if the answer is correct
            }
        });

        return score;
    };

    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [scorePercent, setScorePercent] = useState(0);
    const [passingPercent, setPassingPercent] = useState(0);
    const [startTime] = useState(new Date()); // Gọi ở đầu khi bắt đầu test
    const [testCompleted, setTestCompleted] = useState(false);

    const handleFinishTest = async () => {
        const userId = getId();
        const finalScore = calculateScore();

        const totalPossibleScore = testDetails.questions.reduce((sum, q) => sum + q.points, 0);

        // 👉 Dùng trực tiếp biến chứ không dùng state chưa cập nhật
        const calculatedScorePercent = Math.round((finalScore / totalPossibleScore) * 100);
        const calculatedPassingPercent = Math.round(((totalPossibleScore / 2) / totalPossibleScore) * 100);

        // 👉 Cập nhật state sau khi tính toán xong
        setTotalScore(totalPossibleScore);
        setScore(finalScore);
        setScorePercent(calculatedScorePercent);
        setPassingPercent(calculatedPassingPercent);

        try {
            const response = await axios.post('http://localhost:5000/api/testattempt', {
                test_id: testDetails.test_id,
                user_id: userId,
                answers,
                score: finalScore,
                start_time: startTime,
                end_time: new Date(),
            });

            console.log('Test Attempt saved:', response.data);
            setTestCompleted(true);
        } catch (error) {
            console.error('Error saving test attempt:', error);
        }
    };

    const handleCancel = () => {
       // setTestCompleted(false);
       console.log("jobid", jobId);
        navigate("/");
    };

    const handleApply = async () => {
        try {
            const token = localStorage.getItem('token');

            if (token == null) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            if (!jobId) {  // Ensure job and job_id are available
                alert('Thông tin công việc không hợp lệ.');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/applications',
                { job_id: jobId }, // Only send job_id
                {
                    headers: { Authorization: `Bearer ${token}` } // Authorization header with token
                }
            );

            if (response.status === 201) {
                alert('Đã nộp đơn ứng tuyển thành công!');
                navigate("/");
            } else if (response.status === 401) {
                alert('Bạn cần đăng nhập để ứng tuyển');
            }

        } catch (err) {
            console.error('Error applying for job:', err);

            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message); // Display error message from response
            } else {
                alert('Đã có lỗi xảy ra, vui lòng thử lại.'); // Generic error message
            }
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // "timeout" hoặc "confirm"

    useEffect(() => {
        if (hasStarted && timeLeft === 0) {
            setModalType("timeout");
            setShowModal(true);
        }
    }, [timeLeft]);

    const handleOpenConfirmModal = () => {
        setModalType("confirm");
        setShowModal(true);
    };

    return (
        <>
            <Header />
            {activeTab === 'testHomePage' && (
                <div className="min-h-screen bg-[#f8feff] flex flex-col items-center justify-center px-6 py-12 text-gray-800">
                    <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 items-center">
                        {/* LEFT TEXT CONTENT */}
                        <div className="space-y-6 pl-8">
                            <h1 className="text-5xl font-bold leading-tight text-left">
                                Assess Your Skills with Our Online Test and Boost Your Job Application
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Take the test anytime, anywhere, and receive instant results to showcase your strengths to employers.
                            </p>
                            <div className="flex">
                                <button
                                    onClick={() => handleTabClick('doTestPage')}
                                    className="px-16 py-4 bg-cyan-500 font-bold text-lg text-white rounded-lg hover:bg-cyan-600 transition"
                                >
                                    Take a test
                                </button>
                            </div>
                        </div>

                        {/* RIGHT IMAGE SECTION */}
                        <div className="relative w-full h-[340px] flex items-center justify-center">
                            <div class="relative w-[400px] h-[400px] mx-auto rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-2">
                                <div class="overflow-hidden">
                                    <img src="/images/img1.jpg" class="object-cover w-full h-full rounded-tl-full pt-8 pl-8" alt="Image 1" />
                                </div>

                                <div class="overflow-hidden">
                                    <img src="/images/img2.jpg" class="object-cover w-full h-full rounded-tr-full pt-14 pr-14" alt="Image 2" />
                                </div>

                                <div class="overflow-hidden">
                                    <img src="/images/img3.jpg" class="object-cover w-full h-full rounded-bl-full" alt="Image 3" />
                                </div>

                                <div class="overflow-hidden">
                                    <img src="/images/img4.jpg" class="object-cover w-full h-full rounded-br-full pr-8 pb-8" alt="Image 4" />
                                </div>

                                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2M4 6h16M4 6v12M20 6v12M4 18h16" />
                                    </svg>
                                </div>
                            </div>

                            {/* Center icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md z-10">
                                <BookOpen className="w-7 h-7 text-blue-400" />
                            </div>

                            {/* Decorative dots */}
                            <div className="absolute top-4 right-4 w-10 h-10 bg-orange-300 rounded-full"></div>
                            <div className="absolute bottom-16 left-16 w-8 h-8 bg-orange-300 rounded-full"></div>
                            <div className="absolute bottom-4 right-2 w-4 h-4 bg-blue-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-7 h-7 bg-blue-200 rounded-full"></div>
                            <div className="absolute bottom-0 left-6 w-3 h-3 bg-blue-200 rounded-full"></div>
                        </div>
                    </div>

                    {/* Optional extra section */}
                    <div className="mt-16 text-center">
                        <h2 className="text-xl font-semibold">The Smart Way to Stand Out</h2>
                        <p className="text-gray-500">Our assessment helps you prove your abilities and get noticed by recruiters.</p>
                    </div>
                </div>
            )}
            {activeTab === 'doTestPage' && testDetails && (
                <div className="flex flex-col md:flex-row gap-6 py-6 px-32 bg-gray-50">
                    {/* Questions section */}
                    <div className="flex-1 space-y-6 max-h-[calc(100vh-108px)] overflow-y-auto scrollbar-hide">
                        {testDetails.questions.map((q, index) => (
                            <div key={q._id} id={`question-${q._id}`} className="p-6 mb-6 rounded-xl bg-white shadow border border-gray-200">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="font-semibold text-lg">Question {index + 1}</h2>
                                        <p className="text-sm text-gray-400">Points: {q.points}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleMark(q._id)}
                                        className="p-1 rounded hover:bg-gray-100"
                                        title="Mark for Review"
                                    >
                                        <Flag
                                            size={20}
                                            className={marked.includes(q._id) ? 'text-yellow-400' : 'text-gray-400'}
                                            fill={marked.includes(q._id) ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                </div>

                                {/* Question Text */}
                                <p className="text-base text-gray-800 font-medium mb-4">{q.question}</p>

                                {/* Options */}
                                <div className="space-y-3">
                                    {q.options.map((opt, idx) => (
                                        <label
                                            key={idx}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${q._id}`}
                                                checked={answered[q._id] === opt}
                                                onChange={() => {
                                                    handleAnswer(index, opt);
                                                    handleAnswerById(q._id, opt);
                                                }}
                                                className="form-radio text-blue-600 focus:ring-0"
                                            />
                                            <span className="text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Sidebar with timer & status */}
                    <div className="w-full md:w-80 bg-white shadow rounded-xl px-5 py-6 space-y-4 max-h-[calc(100vh-108px)]">
                        <div className="flex flex-col items-center justify-between text-base text-gray-700 font-semibold tracking-tight py-6 bg-gray-50 rounded-xl">
                            <span>Time to complete</span>
                            <div className="text-orange-500 font-bold flex items-center gap-1">
                                <Clock size={16} />  {formatTime(timeLeft)} / {testDetails.duration}:00
                            </div>
                            {/* Time Progress */}
                            <div className="w-full mt-4 -mb-6">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-red-500 h-3 rounded-full transition-all duration-100 linear"
                                        style={{ width: `${timeProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-base text-gray-800 mb-4">Question Status</h3>
                            {/* Progress Bar */}
                            <div className='flex items-center gap-4 mb-4'>
                                <p className="text-right text-xs font-bold text-gray-500">{answeredCount}/{totalQuestions}</p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="text-xs flex items-center justify-between">
                                <div className='flex gap-2 text-xs items-center justify-between'>
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span>Answered</span>
                                </div>
                                <div className='flex gap-2 text-xs items-center justify-between'>
                                    <div className="w-3 h-3 rounded-full border border-gray-400"></div>
                                    <span>In progress</span>
                                </div>
                                <div className='flex gap-2 text-xs items-center justify-between'>
                                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                    <span>Marked</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Navigation Grid */}
                        <div className="tracking-tight p-4 bg-gray-50 rounded-xl">
                            <div className="grid grid-cols-5 gap-2 justify-items-center text-gray-800">
                                {testDetails.questions.map((q, index) => {
                                    const isMarked = marked.includes(q._id);
                                    const isAnswered = answered.hasOwnProperty(q._id);

                                    return (
                                        <button
                                            key={q._id}
                                            onClick={() =>
                                                document
                                                    .getElementById(`question-${q._id}`)
                                                    ?.scrollIntoView({ behavior: 'smooth' })
                                            }
                                            className={clsx(
                                                'relative w-8 h-8 flex items-center justify-center rounded-md text-sm',
                                                isAnswered
                                                    ? 'bg-blue-500 text-white font-medium'
                                                    : 'bg-white border border-gray-300 text-gray-600'
                                            )}
                                        >
                                            {isMarked && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"></div>
                                            )}
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button onClick={handleOpenConfirmModal} className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition">
                            Submit Test
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4">
                            {modalType === "timeout" ? (
                                <FaClock className="text-red-500 text-3xl" />
                            ) : (
                                <FaCheckCircle className="text-blue-600 text-3xl" />
                            )}
                            <h2 className="text-xl font-bold text-gray-800">
                                {modalType === "timeout" ? "Hết thời gian làm bài" : "Xác nhận nộp bài"}
                            </h2>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {modalType === "timeout"
                                ? "Thời gian làm bài đã hết. Hệ thống sẽ tự động nộp bài của bạn."
                                : "Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời."}
                        </p>

                        <div className="flex justify-end gap-3">
                            {modalType !== "timeout" && (
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex items-center gap-1 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <FaTimes /> Hủy
                                </button>
                            )}
                            <button
                                onClick={handleFinishTest}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-white transition ${modalType === "timeout"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {modalType === "timeout" ? "Xem kết quả" : "Nộp bài"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {testCompleted && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl text-center relative border-2 border-teal-700">
                        <h2 className="text-2xl font-bold text-white bg-teal-700 rounded-t-xl py-4 mb-6">
                            Your Result
                        </h2>
                        <div className="flex justify-around items-center mb-6">
                            {/* Your Score */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-24 h-24">
                                    <svg className="absolute top-0 left-0 w-full h-full">
                                        <circle
                                            className="text-gray-200"
                                            strokeWidth="10"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="38"
                                            cx="48"
                                            cy="48"
                                        />
                                        <circle
                                            className={`${scorePercent >= passingPercent ? 'text-green-500' : 'text-red-500'}`}
                                            strokeWidth="10"
                                            strokeDasharray="238"
                                            strokeDashoffset={238 - (238 * scorePercent) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="38"
                                            cx="48"
                                            cy="48"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                                        {scorePercent}%
                                    </div>
                                </div>
                                <p className="mt-2 font-medium text-sm">Your Score: {score.toString().padStart(2, '0')}</p>
                            </div>

                            {/* Passing Score */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-24 h-24">
                                    <svg className="absolute top-0 left-0 w-full h-full">
                                        <circle
                                            className="text-gray-200"
                                            strokeWidth="10"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="38"
                                            cx="48"
                                            cy="48"
                                        />
                                        <circle
                                            className="text-green-500"
                                            strokeWidth="10"
                                            strokeDasharray="238"
                                            strokeDashoffset={238 - (238 * passingPercent) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="38"
                                            cx="48"
                                            cy="48"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                                        {passingPercent}%
                                    </div>
                                </div>
                                <p className="mt-2 font-medium text-sm">Passing Score: {totalScore / 2}</p>
                            </div>
                        </div>

                        {/* Result Message */}
                        <div className="mb-4">
                            {score >= (totalScore / 2) ? (
                                <div className="text-green-600 font-semibold text-lg">🎉 You passed the test!</div>
                            ) : (
                                <div className="text-red-600 font-semibold text-lg flex items-center justify-center gap-2">
                                    ❌ You didn't pass
                                </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                                {score >= (totalScore / 2)
                                    ? 'Great job! You’re eligible to proceed.'
                                    : 'Better Luck Next Time!'}
                            </p>
                        </div>

                        {/* Button */}
                        <button
                            className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 px-6 rounded-full mt-4 transition"
                            onClick={score >= (totalScore / 2) ? handleApply : handleCancel}
                        >
                            {score >= (totalScore / 2) ? 'Apply' : 'Go Back!'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default TestPage

