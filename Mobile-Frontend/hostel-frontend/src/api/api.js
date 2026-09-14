import client from "./axios";

// ---------- Auth ----------
export const loginAdmin = (email) => client.post("/loginAdmin", { email });
export const loginStudent = (email) => client.post("/loginStudent", { email });
export const loginWorker = (email) => client.post("/login/worker", { email });
export const verifyOtp = (email, otp) => client.post("/verifyOtp", { email, otp });
export const resendOtp = (email) => client.post("/resendOtp", { email });
export const logout = () => client.post("/logout");

// ---------- Dashboards ----------
export const studentDashboard = () => client.get("/studentDashboard");
export const adminDashboard = () => client.get("/adminDashboard");

// ---------- Profile ----------
export const studentProfile = (studentId) => client.get(`/studentProfile/${studentId}`);
export const adminProfile = () => client.get("/adminProfile");
export const updateMyProfile = (data) => client.patch("/updateMyProfile", data);
export const updateProfileByAdmin = (id, data) => client.patch(`/updateProfileByAdmin/${id}`, data);

// ---------- Students (admin) ----------
export const registerStudent = (data) => client.post("/registerStudent", data);
export const deleteStudent = (id) => client.delete(`/deleteStudent/${id}`);
export const allResidentStudents = (page = 1, limit = 10) => client.get(`/allResidentStudents?page=${page}&limit=${limit}`);
export const pastStudents = (page = 1, limit = 10) => client.get(`/pastStudents?page=${page}&limit=${limit}`);
export const getStudentByCollege = (collegeName, page = 1, limit = 10) => client.get(`/getStudentByCollege/${encodeURIComponent(collegeName)}?page=${page}&limit=${limit}`);
export const searchStudent = (query, page = 1, limit = 10) => client.get(`/searchStudent?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
export const shiftStudentRoom = (studentId, newRoomNo) => client.patch(`/shiftStudentRoom/${studentId}`, { newRoomNo });

// ---------- Rooms (admin) ----------
export const isSpace = (roomNo) => client.get(`/isSpace/${roomNo}`);
export const createRoom = (data) => client.post("/createRoom", data);
export const updateRoom = (roomNo, data) => client.patch(`/updateRoom/${roomNo}`, data);
export const getAllRooms = (page = 1, limit = 10) => client.get(`/getAllRooms?page=${page}&limit=${limit}`);
export const getRoomByNumber = (roomNo) => client.get(`/getRoomByNumber/${roomNo}`);
export const deleteRoom = (roomNo) => client.delete(`/deleteRoom/${roomNo}`);

// ---------- Mess menu ----------
export const createMenu = (data) => client.post("/createMenu", data);
export const getMenu = (page = 1, limit = 10) => client.get(`/getMenu?page=${page}&limit=${limit}`);
export const getMenuByDay = (day) => client.get(`/getMenuByDay/${day}`);
export const todayMenu = () => client.get("/todayMenu");
export const updateMessMenu = (day, type, data) => client.patch(`/updateMessMenu/${day}/${type}`, data);
export const deleteMenu = (day, type) => client.delete(`/deleteMenu/${day}/${type}`);

// ---------- Complaints ----------
export const fileComplaint = (data) => client.post("/fileComplaint", data);
export const myComplaints = (page = 1, limit = 10) => client.get(`/myComplaints?page=${page}&limit=${limit}`);
export const updateComplaint = (id, data) => client.patch(`/updateComplaint/${id}`, data);
export const deleteComplaint = (id) => client.delete(`/deleteComplaint/${id}`);
export const resolveComplaint = (id) => client.patch(`/resolveComplaint/${id}`);
export const viewComplaint = (page = 1, limit = 10) => client.get(`/viewComplaint?page=${page}&limit=${limit}`);
export const viewRoomComplaint = (roomNo, page = 1, limit = 10) => client.get(`/viewRoomComplaint/${roomNo}?page=${page}&limit=${limit}`);
export const viewComplaintByStatus = (page = 1, limit = 10) => client.get(`/viewComplaintByStatus?page=${page}&limit=${limit}`);
export const complaintStats = () => client.get("/complaintStats");

// ---------- Fees ----------
export const createFeeStructure = (data) => client.post("/createFeeStructure", data);
export const getMyFees = () => client.get("/getMyFees");
export const getPendingFees = (page = 1, limit = 10) => client.get(`/getPendingFees?page=${page}&limit=${limit}`);
export const getStudentPendingFees = (studentId) => client.get(`/studentPendingFees/${studentId}`);
export const payFee = (feeId, installmentId) => client.post(`/payFee?feeId=${feeId}&installmentId=${installmentId}`);
export const updateStudentInstallmentByAdmin = (studentId, installmentId, data) =>
  client.put(`/students/${studentId}/installments/${installmentId}`, data);

// ---------- Leave / outings ----------
export const applyLeave = (data) => client.post("/applyLeave", data);
export const returnToHostel = (outingId) => client.post("/returnToHostel", { outingId });
export const studentsOnLeave = (page = 1, limit = 10) => client.get(`/studentOnLeave?page=${page}&limit=${limit}`);

// ---------- Bus ----------
export const createBus = (data) => client.post("/createBus", data);
export const updateBus = (busId, data) => client.patch(`/updateBus/${busId}`, data);
export const viewBus = (page = 1, limit = 10) => client.get(`/viewBus?page=${page}&limit=${limit}`);
export const deleteBus = (busId) => client.delete(`/deleteBus/${busId}`);

// ---------- KYC ----------
export const submitKyc = (data) => client.post("/submitKyc/", data);
export const getMyKyc = () => client.get("/getMyKyc");
export const getPendingKyc = (page = 1, limit = 10) => client.get(`/getPendingKyc?page=${page}&limit=${limit}`);
export const approveKyc = (id) => client.post(`/approveKyc/${id}`);
export const rejectKyc = (id, reason) => client.post(`/rejectKyc/${id}`, { reason });

// ---------- Announcements ----------
export const createAnnouncement = (data) => client.post("/createAnnouncement", data);
export const updateAnnouncement = (id, data) => client.patch(`/updateAnnouncement/${id}`, data);
export const getAnnouncements = (page = 1, limit = 10) => client.get(`/getAnnouncement?page=${page}&limit=${limit}`);
export const deleteAnnouncement = (id) => client.delete(`/deleteAnnouncement/${id}`);

// ---------- Admin contacts ----------
export const getAdminContacts = () => client.get("/getAdminContacts");

// ---------- Workers ----------
export const registerWorker = (data) => client.post("/register/worker", data);
export const removeWorker = (id) => client.patch(`/remove/worker/${id}`);

// ---------- Lunchbox (student) ----------
export const bookLunchBox = () => client.post("/lunchbox/book");
export const cancelLunchBox = () => client.delete("/lunchbox/cancel");
export const getMyLunchBoxStatus = () => client.get("/lunchbox/my-status");

// ---------- Lunchbox (worker) ----------
export const getTodayLunchBoxes = () => client.get("/lunchbox/today");
export const getTodayLunchBoxesByCollege = (search) => client.get(`/lunchbox/today/college?search=${encodeURIComponent(search)}`);
export const getTodayLunchBoxSummary = () => client.get("/lunchbox/today/summary");
export const collectLunchBox = (lunchBoxId) => client.patch(`/lunchbox/collect/${lunchBoxId}`);
