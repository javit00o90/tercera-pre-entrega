import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
});

ticketSchema.pre('save', async function(next) {
    if (!this.code) {
        let codeExists = true;
        let newCode;
        while (codeExists) {
            newCode = Math.random().toString(36).substring(2, 10);
            const existingTicket = await mongoose.models.tickets.findOne({ code: newCode });
            if (!existingTicket) {
                codeExists = false;
            }
        }
        this.code = newCode;
    }
    next();
});
export const ticketsModel = mongoose.model("tickets", ticketSchema);