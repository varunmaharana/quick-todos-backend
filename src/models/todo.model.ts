import mongoose, { Document, Schema } from "mongoose";
import {
    PRIORITY_VALUES,
    PriorityType,
    STATUS_VALUES,
    StatusType,
} from "../constants/enums";

export interface TodoI extends Document {
    title: string;
    description?: string;
    parentTodo?: Schema.Types.ObjectId;
    subTodos?: Schema.Types.ObjectId[];
    createdBy: Schema.Types.ObjectId;
    status: StatusType;
    priority: PriorityType;
}

const todoSchema = new Schema<TodoI>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            index: true,
        },
        description: {
            type: String,
        },
        parentTodo: {
            type: Schema.Types.ObjectId,
            ref: "Todo",
        },
        subTodos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Todo",
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: STATUS_VALUES,
            required: [true, "Status is required"],
            default: "PENDING",
        },
        priority: {
            type: String,
            enum: PRIORITY_VALUES,
            default: "NONE",
        },
    },
    { timestamps: true }
);

export const Todo = mongoose.model<TodoI>("Todo", todoSchema);
