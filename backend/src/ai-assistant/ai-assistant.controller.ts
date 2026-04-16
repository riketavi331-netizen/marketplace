import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { AiAssistantService, AiRequest } from './ai-assistant.service';

@ApiTags('ai-assistant')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private aiService: AiAssistantService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Чат с AI-стилистом' })
  chat(@Body() req: AiRequest) {
    return this.aiService.chat(req);
  }
}
