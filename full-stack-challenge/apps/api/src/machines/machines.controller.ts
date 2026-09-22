import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { MachinesService } from "./machines.service";
import { JwtPayload } from "../common/types/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateMachineDto } from "./dto/create-machine.dto";
import { UpdateMachineDto } from "./dto/update-machine.dto";
import { ListMachinesQueryDto } from "./dto/list-machines-query.dto";

@Controller("machines")
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMachinesQueryDto,
  ) {
    return this.machinesService.findAll(user.sub, query);
  }

  @Get("options")
  listOptions(@CurrentUser() user: JwtPayload) {
    return this.machinesService.listOptions(user.sub);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.machinesService.findOne(user.sub, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMachineDto) {
    return this.machinesService.create(user.sub, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMachineDto,
  ) {
    return this.machinesService.update(user.sub, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.machinesService.remove(user.sub, id);
  }
}
