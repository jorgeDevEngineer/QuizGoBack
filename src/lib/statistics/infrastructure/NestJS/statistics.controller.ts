import { Body, Controller, Get, HttpCode, Inject, Param, Query } from '@nestjs/common';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { DomainException } from '../../../shared/exceptions/DomainException';

@Controller('reports')
export class StatisticsController {

}