const express = require('express');
const router = express.Router();
const Category = require('../models/CategorySchema');
const mongoose = require('mongoose');


// 📌 Lấy tất cả danh mục nghề nghiệp
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ state: 'active' }); // Lọc theo trạng thái
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ' });
  } 
});
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find(); // Lọc theo trạng thái
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/careersByCategoryId/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  // Kiểm tra định dạng ID
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  try {
    // Tìm Category theo _id và state là 'active'
    const category = await Category.findOne({ _id: categoryId, state: 'active' });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy ngành (Category) đang hoạt động' });
    }

    // Trả về mảng careers từ category
    res.json(category.careers);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu careers' });
  }
});

router.post('/', async (req, res) => {
  const { name, careers, state } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  }

  try {
    const newCategory = new Category({
      name: name.trim(),
      careers: careers || [],
      state: state || 'active'
    });

    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.name) {
      res.status(400).json({ message: 'Tên danh mục đã tồn tại!' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Lỗi máy chủ!' });
    }
  }
});

// 📌 Thêm nghề nghiệp con vào danh mục
router.post('/:id/careers', async (req, res) => {
  try {
    const { title } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { $push: { careers: { title } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Không thể thêm nghề nghiệp' });
  }
});

// 📌 Xoá một nghề nghiệp khỏi danh mục
router.delete('/:catId/careers/:careerId', async (req, res) => {
  try {
    const { catId, careerId } = req.params;
    const updated = await Category.findByIdAndUpdate(
      catId,
      { $pull: { careers: { _id: careerId } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Không thể xoá nghề nghiệp' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, careers, state } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, careers, state }, // Thêm state vào đối tượng cập nhật
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.json(updatedCategory);
  } catch (err) {
    console.error('Lỗi khi cập nhật danh mục:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
