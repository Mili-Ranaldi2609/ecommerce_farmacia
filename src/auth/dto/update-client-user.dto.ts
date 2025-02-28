import { PartialType } from "@nestjs/mapped-types";
import { ClientUser } from "./client-user.dto";

export class UpdateClientUser extends PartialType(ClientUser) {
    id: number;
}