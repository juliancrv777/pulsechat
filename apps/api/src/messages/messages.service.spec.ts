import {BadRequestException} from '@nestjs/common';
import {MessagesService} from './messages.service';

describe('MessagesService',()=>{
  const db:any={channel:{findUnique:jest.fn()},membership:{findUnique:jest.fn()},message:{findMany:jest.fn(),create:jest.fn()}};
  let service:MessagesService;

  beforeEach(()=>{
    jest.clearAllMocks();
    service=new MessagesService(db);
    db.channel.findUnique.mockResolvedValue({id:'channel-1',workspaceId:'workspace-1'});
    db.membership.findUnique.mockResolvedValue({userId:'user-1',workspaceId:'workspace-1'});
  });

  it('rejects an invalid history cursor',async()=>{
    await expect(service.history('user-1','channel-1','not-a-date')).rejects.toBeInstanceOf(BadRequestException);
    expect(db.message.findMany).not.toHaveBeenCalled();
  });

  it('rejects blank messages after trimming',async()=>{
    await expect(service.create('user-1','channel-1','   ')).rejects.toBeInstanceOf(BadRequestException);
    expect(db.message.create).not.toHaveBeenCalled();
  });

  it('stores normalized message content',async()=>{
    db.message.create.mockImplementation(async({data}:any)=>data);
    const result:any=await service.create('user-1','channel-1','  hello PulseChat  ');
    expect(result.content).toBe('hello PulseChat');
  });
});
