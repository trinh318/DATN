const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// Thêm gói mới
router.post('/add', async (req, res) => {
  try {
    const { name, price, duration, postLimit, features, description, priority, status } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin gói.' });
    }

    const newPackage = new Package({
      name,
      price,
      duration, // số ngày (vd: 30 ngày)
      features, // mảng các tính năng
      description,
      postLimit,
      priority,
      status
    });

    await newPackage.save();
    res.status(201).json({ message: 'Thêm gói thành công', package: newPackage });
  } catch (error) {
    console.error('Lỗi khi thêm gói:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm gói.' });
  }
});
// Lấy tất cả các gói
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ packages });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách gói:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách gói.' });
  }
});

router.get('/view', async (req, res) => {
  try {
    const packages = await Package.find({ status: 'active' });
    res.status(200).json({ packages });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách gói:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách gói.' });
  }
});
// Cập nhật gói theo ID
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, postLimit, features, description, priority, status } = req.body;

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { name, price, duration, postLimit, features, description, priority, status },
      { new: true } // trả về bản ghi sau khi cập nhật
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Không tìm thấy gói.' });
    }

    res.status(200).json({ message: 'Cập nhật gói thành công.', package: updatedPackage });
  } catch (error) {
    console.error('Lỗi khi cập nhật gói:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật gói.' });
  }
});

router.put('/deactivate/:id', async (req, res) => {
  try {
      const { id } = req.params;

      // Update the package to deactivate it
      const deactivatedPackage = await Package.findByIdAndUpdate(
          id, 
          { status: 'inactive' }, // Change the status to 'inactive'
          { new: true } // Return the updated document
      );

      if (!deactivatedPackage) {
          return res.status(404).json({ message: 'Gói đăng ký không tìm thấy.' });
      }

      res.json({ message: 'Gói đăng ký đã được ẩn thành công!', package: deactivatedPackage });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Có lỗi xảy ra khi ẩn gói.' });
  }
});

router.get('/view/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const packageItem = await Package.findById(id);

      if (!packageItem) {
          return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
      }

      res.status(200).json({ package: packageItem });
  } catch (error) {
      console.error('Lỗi khi lấy gói dịch vụ:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy gói dịch vụ.' });
  }
});
module.exports = router;
