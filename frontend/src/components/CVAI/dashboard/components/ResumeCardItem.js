import { Loader2Icon, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/control/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/control/ui/alert-dialog";
import { toast } from 'sonner';
import axios from 'axios';
import "../../../../index.css";

function ResumeCardItem({ resume, refreshData }) {
    const navigation = useNavigate();
    const [openAlert, setOpenAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const onDelete = async () => {
        try {
            setLoading(true); // Bắt đầu quá trình xóa, hiển thị loading
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
    
            if (!token) {
                toast.error('Token is missing, please login again.');
                setLoading(false);
                return;
            }
    
            // Gửi yêu cầu DELETE để xóa toàn bộ CV và các dữ liệu liên quan
            await axios.delete(`http://localhost:5000/api/aicv/resume/${resume.profile?._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Gửi token trong header
                },
            });
    
            // Nếu xóa thành công, thông báo và cập nhật lại danh sách
            toast.success('Resume and all related data deleted successfully!');
            refreshData(); // Gọi lại hàm để load danh sách mới
    
            // Đóng alert hoặc modal sau khi hoàn thành
            setOpenAlert(false);
        } catch (error) {
            console.error('Failed to delete resume:', error);
            toast.error('Delete failed');
        } finally {
            setLoading(false); // Kết thúc quá trình, ẩn loading
        }
    };    

    return (
        <div className=''>
            <Link to={`/create-cv-with-ai/resume/${resume.profile?._id}/edit`}>
                <div className='p-14 bg-gradient-to-b from-pink-100 via-purple-200 to-blue-200 h-[280px] rounded-t-lg border-t-4'>
                    <div className='flex items-center justify-center h-[180px]'>
                        <img src="/cv.png" width={80} height={80} />
                    </div>
                </div>
            </Link>
            <div className='border p-3 flex justify-between text-white rounded-b-lg shadow-lg bg-blue-500'>
                <h2 className='text-sm'>{resume.profile?.title}</h2>

                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className='h-4 w-4 cursor-pointer' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigation(`/create-cv-with-ai/resume/${resume.profile?._id}/edit`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigation(`/create-cv-with-ai/my-resume/${resume.profile?._id}/view`)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigation(`/create-cv-with-ai/my-resume/${resume.profile?._id}/view`)}>Download</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenAlert(true)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={openAlert}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your resume.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setOpenAlert(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} disabled={loading}>
                                {loading ? <Loader2Icon className='animate-spin' /> : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export default ResumeCardItem;
