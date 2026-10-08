import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const config=sqliteTable('config',{id:integer('id').primaryKey(),encrypted:text('encrypted').notNull()});
export const receipts=sqliteTable('receipts',{id:integer('id').primaryKey({autoIncrement:true}),request:text('request').notNull().unique(),digest:text('digest').notNull(),status:text('status').notNull().default('pending'),created:integer('created').notNull()});
export const limits=sqliteTable('limits',{key:text('key').primaryKey(),count:integer('count').notNull()});

export const owner=sqliteTable('owner',{id:integer('id').primaryKey(),userId:text('user_id').notNull()});
