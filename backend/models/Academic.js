const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới model User
        required: true,
    },
    industry: { //chuyên ngành
        type: String,
        required: true,
        trim: true,
    },
    school_name: { // trường
        type: String,
    },
    degree: { // bằng cấp (Trung học, Trung cấp, Cao đẳng, Cử nhân, Thạc sĩ, Tiến sĩ, Khác)
        type: String,
    },
    start_date: { //format 01/2001
        type: String,
    },
    end_date: { //format 01/2001
        type: String,

    },
    achievements: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

const Academic = mongoose.model('Academic', academicSchema);

module.exports = Academic;
