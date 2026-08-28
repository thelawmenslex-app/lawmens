const Casebook = require('../../models/casebookmaster');
const Category = require('../../models/category');
const MinorAct = require('../../models/minorAct');
const MinorActSection = require('../../models/minorActSection');
const FirstSchedule = require('../../models/firstschedule');
const SecondSchedule = require('../../models/secondschedule');
const User = require('../../models/user');
const Note = require('../../models/note');
const ContentHistory = require('../../models/contentHistory');
const { sendResponse, errorHandler } = require('../../../utils/common_functions');

// 1. Incremental Sync Pull
const syncPull = async (req, res) => {
  try {
    const { sinceVersion, lastSyncTime } = req.query;
    const sinceDate = lastSyncTime ? new Date(lastSyncTime) : new Date(0);
    const userId = req.userId;

    const [
      updatedBooks,
      updatedSections,
      updatedMinorActs,
      updatedMinorSections,
      updatedFirstSchedules,
      updatedSecondSchedules
    ] = await Promise.all([
      Casebook.find({ updatedAt: { $gt: sinceDate } }).lean(),
      Category.find({ updatedAt: { $gt: sinceDate } }).lean(),
      MinorAct.find({ updatedAt: { $gt: sinceDate } }).lean(),
      MinorActSection.find({ updatedAt: { $gt: sinceDate } }).lean(),
      FirstSchedule.find({ updatedAt: { $gt: sinceDate } }).lean(),
      SecondSchedule.find({ updatedAt: { $gt: sinceDate } }).lean()
    ]);

    let userData = null;
    if (userId) {
      const [userProfile, userNotes, userHistory] = await Promise.all([
        User.findById(userId).select('-password -otp -otpCreatedOn').populate('professionId', 'name').lean(),
        Note.find({ userId, updatedAt: { $gt: sinceDate } }).lean(),
        ContentHistory.find({ userId, updatedAt: { $gt: sinceDate } }).lean()
      ]);
      userData = {
        profile: userProfile,
        notes: userNotes,
        history: userHistory
      };
    }

    const currentServerVersion = Date.now();

    return sendResponse(res, true, 200, 'Sync pull completed successfully.', {
      serverVersion: currentServerVersion,
      syncTimestamp: new Date().toISOString(),
      changes: {
        books: updatedBooks,
        sections: updatedSections,
        minorActs: updatedMinorActs,
        minorActSections: updatedMinorSections,
        firstSchedules: updatedFirstSchedules,
        secondSchedules: updatedSecondSchedules
      },
      userData
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

// 2. Offline Operation Queue Push
const syncPush = async (req, res) => {
  try {
    const { operations = [] } = req.body;
    const userId = req.userId;
    const results = [];

    for (const op of operations) {
      const { id, type, payload = {}, timestamp } = op;
      try {
        if (type === 'BOOKMARK_ADD' && userId) {
          await User.findByIdAndUpdate(userId, {
            $addToSet: { bookMarks: payload.sectionId }
          });
          results.push({ id, status: 'SUCCESS' });
        } else if (type === 'BOOKMARK_REMOVE' && userId) {
          await User.findByIdAndUpdate(userId, {
            $pull: { bookMarks: payload.sectionId }
          });
          results.push({ id, status: 'SUCCESS' });
        } else if (type === 'RECORD_HISTORY' && userId) {
          await ContentHistory.create({
            userId,
            categoryId: payload.sectionId || payload.categoryId,
            bookId: payload.bookId,
            isActive: true,
            createdAt: timestamp ? new Date(timestamp) : new Date()
          });
          results.push({ id, status: 'SUCCESS' });
        } else if (type === 'NOTE_SAVE' && userId) {
          if (payload._id) {
            await Note.findByIdAndUpdate(payload._id, {
              content: payload.content,
              title: payload.title,
              updatedAt: new Date()
            });
          } else {
            await Note.create({
              userId,
              sectionId: payload.sectionId,
              title: payload.title || 'Legal Note',
              content: payload.content,
              createdAt: new Date()
            });
          }
          results.push({ id, status: 'SUCCESS' });
        } else if (type === 'PROFILE_UPDATE' || type === 'UPDATE_PROFILE') {
          const updateFields = {};
          if (payload.firstName) updateFields.firstName = payload.firstName;
          if (payload.lastName !== undefined) updateFields.lastName = payload.lastName;
          if (payload.phoneNumber || payload.phone) updateFields.phoneNumber = String(payload.phoneNumber || payload.phone).trim();
          if (payload.professionId) updateFields.professionId = payload.professionId;
          updateFields.updatedAt = new Date();

          if (userId) {
            await User.findByIdAndUpdate(userId, updateFields);
          } else if (payload.email) {
            await User.findOneAndUpdate({ email: new RegExp('^' + payload.email.trim() + '$', 'i') }, updateFields);
          }

          try {
            const { broadcastContentChange } = require('../../../services/socketService');
            broadcastContentChange('user', userId || payload.email, 'updated', { user: updateFields });
          } catch (e) {}

          results.push({ id, status: 'SUCCESS' });
        } else {
          results.push({ id, status: 'IGNORED', message: 'Unknown operation or missing auth' });
        }
      } catch (err) {
        results.push({ id, status: 'ERROR', error: err.message });
      }
    }

    return sendResponse(res, true, 200, 'Sync push processed successfully.', {
      processedCount: results.length,
      serverVersion: Date.now(),
      results
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = {
  syncPull,
  syncPush
};
