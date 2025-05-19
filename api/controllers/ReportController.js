const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  // Create a new report
  create: async function(req, res) {
    try {
      const {
        patientId,
        doctorId,
        treatmentId,
        appointmentId,
        reportType,
        title,
        description,
        findings,
        recommendations,
        isPrivate,
      } = req.body;

      // Handle file uploads
      const mediaUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `dental-clinic/reports/${patientId}`,
            resource_type: 'auto',
          });

          mediaUrls.push({
            url: result.secure_url,
            type: result.resource_type,
            format: result.format,
            publicId: result.public_id,
            thumbnailUrl: result.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'),
          });

          // Clean up temporary file
          fs.unlinkSync(file.path);
        }
      }

      // Create report
      const report = await Report.create({
        patientId,
        doctorId,
        treatmentId,
        appointmentId,
        reportType,
        title,
        description,
        findings,
        recommendations,
        isPrivate,
        mediaUrls,
      }).fetch();

      return res.status(201).json({
        message: 'Report created successfully',
        report,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error creating report' });
    }
  },

  // Get reports for a patient
  getPatientReports: async function(req, res) {
    try {
      const { patientId } = req.params;
      const reports = await Report.find({
        where: { patientId },
        sort: 'date DESC',
      });

      return res.json({ reports });
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching reports' });
    }
  },

  // Get reports for a treatment
  getTreatmentReports: async function(req, res) {
    try {
      const { treatmentId } = req.params;
      const reports = await Report.find({
        where: { treatmentId },
        sort: 'date DESC',
      });

      return res.json({ reports });
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching reports' });
    }
  },

  // Update a report
  update: async function(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Handle new file uploads
      if (req.files && req.files.length > 0) {
        const mediaUrls = [];
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `dental-clinic/reports/${updateData.patientId}`,
            resource_type: 'auto',
          });

          mediaUrls.push({
            url: result.secure_url,
            type: result.resource_type,
            format: result.format,
            publicId: result.public_id,
            thumbnailUrl: result.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'),
          });

          // Clean up temporary file
          fs.unlinkSync(file.path);
        }

        // Merge new media URLs with existing ones
        const existingReport = await Report.findOne({ id });
        updateData.mediaUrls = [...(existingReport.mediaUrls || []), ...mediaUrls];
      }

      const updatedReport = await Report.updateOne({ id }).set(updateData);
      return res.json({
        message: 'Report updated successfully',
        report: updatedReport,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error updating report' });
    }
  },

  // Delete a report and its associated media
  destroy: async function(req, res) {
    try {
      const { id } = req.params;
      const report = await Report.findOne({ id });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Delete media files from Cloudinary
      if (report.mediaUrls && report.mediaUrls.length > 0) {
        for (const media of report.mediaUrls) {
          await cloudinary.uploader.destroy(media.publicId);
        }
      }

      // Delete report from database
      await Report.destroyOne({ id });

      return res.json({ message: 'Report deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Error deleting report' });
    }
  },
}; 