import {BadRequestException,ForbiddenException,Injectable,NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';

@Injectable()
export class MessagesService{
  constructor(private readonly db:PrismaService){}

  async requireChannelMember(userId:string,channelId:string){
    const channel=await this.db.channel.findUnique({where:{id:channelId},select:{id:true,workspaceId:true}});
    if(!channel)throw new NotFoundException('Channel not found');
    const membership=await this.db.membership.findUnique({where:{userId_workspaceId:{userId,workspaceId:channel.workspaceId}}});
    if(!membership)throw new ForbiddenException('Channel membership required');
    return channel;
  }

  async history(userId:string,channelId:string,before?:string){
    await this.requireChannelMember(userId,channelId);
    let beforeDate:Date|undefined;
    if(before){
      beforeDate=new Date(before);
      if(Number.isNaN(beforeDate.getTime()))throw new BadRequestException('Invalid before timestamp');
    }
    return this.db.message.findMany({
      where:{channelId,...(beforeDate?{createdAt:{lt:beforeDate}}:{})},
      take:50,
      orderBy:{createdAt:'desc'},
      include:{author:{select:{id:true,name:true}}},
    }).then(rows=>rows.reverse());
  }

  async create(userId:string,channelId:string,content:string){
    await this.requireChannelMember(userId,channelId);
    const normalized=content.trim();
    if(!normalized)throw new BadRequestException('Message cannot be empty');
    return this.db.message.create({
      data:{channelId,authorId:userId,content:normalized},
      include:{author:{select:{id:true,name:true}}},
    });
  }
}
