const Casebook = require('../../models/casebookmaster');
const Category = require('../../models/category');
const Note = require('../../models/note');
const User = require('../../models/user');
const { sendResponse, errorHandler } = require('../../../utils/common_functions');

// Pull updates from the server
const pullSync = async (req, res) => {
    try {
        const lastSyncTime = parseInt(req.query.lastSyncTimestamp) || 0;
        const lastSyncDate = new Date(lastSyncTime);
        const newSyncTimestamp = Date.now();
        const userId = req.userId;

        // Fetch Casebooks updated after lastSyncDate
        const casebooks = await Casebook.find({ updatedAt: { $gt: lastSyncDate } }).lean();

        // Fetch Categories updated after lastSyncDate
        const categories = await Category.find({ updatedAt: { $gt: lastSyncDate } }).lean();

        // Fetch user-specific notes updated after lastSyncDate
        const notes = await Note.find({ userId, updatedAt: { $gt: lastSyncDate } }).lean();

        // Fetch user (to extract bookmarks if updated since last sync)
        const user = await User.findById(userId).select('bookMarks updatedAt').lean();
        const bookmarks = user && user.updatedAt > lastSyncDate ? user.bookMarks : [];

        const activeCategoryIds = await Category.find().distinct('_id');
        const activeCasebookIds = await Casebook.find().distinct('_id');

        const syncData = {
            newSyncTimestamp,
            changes: {
                casebooks,
                categories,
                notes,
                bookmarks
            },
            activeIds: {
                categories: activeCategoryIds,
                casebooks: activeCasebookIds
            }
        };

        return sendResponse(res, true, 200, 'Sync pull data retrieved successfully.', syncData);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Push client local changes to the server
const pushSync = async (req, res) => {
    try {
        const { notes, bookmarks } = req.body;
        const userId = req.userId;
        const mongoose = require('mongoose');

        // Process client local notes sync
        if (Array.isArray(notes)) {
            for (const note of notes) {
                let noteId = note._id;
                if (!mongoose.Types.ObjectId.isValid(noteId)) {
                    noteId = new mongoose.Types.ObjectId();
                }

                // If it is soft deleted locally
                if (note.isDeleted) {
                    await Note.updateOne(
                        { _id: noteId, userId },
                        { $set: { isDeleted: true } }
                    );
                } else {
                    // Update or insert (upsert) the note document
                    await Note.updateOne(
                        { _id: noteId, userId },
                        { 
                            $set: { 
                                noteText: note.noteText, 
                                sectionId: note.sectionId, 
                                isDeleted: false 
                            } 
                        },
                        { upsert: true }
                    );
                }
            }
        }

        // Process client bookmarks sync (replace server bookmarks with fresh client state)
        if (Array.isArray(bookmarks)) {
            await User.updateOne(
                { _id: userId },
                { $set: { bookMarks: bookmarks } }
            );
        }

        return sendResponse(res, true, 200, 'Sync push changes merged successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    pullSync,
    pushSync
};
