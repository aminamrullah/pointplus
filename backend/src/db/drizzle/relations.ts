import { relations } from "drizzle-orm/relations";
import { menus } from "./schema";

export const menusRelations = relations(menus, ({one, many}) => ({
	menu: one(menus, {
		fields: [menus.parentId],
		references: [menus.id],
		relationName: "menus_parentId_menus_id"
	}),
	menus: many(menus, {
		relationName: "menus_parentId_menus_id"
	}),
}));