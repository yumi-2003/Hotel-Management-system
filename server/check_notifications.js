
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env' });

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String },
  isRead: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

async function checkNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const total = await Notification.countDocuments();
    console.log('Total notifications before:', total);

    // Try to find a user to be the recipient
    const UserSchema = new mongoose.Schema({ email: String });
    const User = mongoose.model('User', UserSchema);
    const user = await User.findOne();
    
    if (user) {
      console.log('Found user:', user.email, user._id);
      try {
        const newNotif = await Notification.create({
          recipient: user._id,
          message: 'Test notification from script',
          type: 'system',
          link: '/test'
        });
        console.log('Successfully created notification:', newNotif._id);
      } catch (createError) {
        console.error('Failed to create notification:', createError);
      }
    } else {
      console.log('No user found to test notification creation');
    }

    const totalAfter = await Notification.countDocuments();
    console.log('Total notifications after:', totalAfter);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNotifications();
