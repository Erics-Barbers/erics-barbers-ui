import { BarbersService } from '../generated/services/BarbersService';
import { CreateBarberDto, UpdateBarberDto } from '../generated';

export class BarbersRepository {
  public async barbersControllerGetBarbers() {
    return await BarbersService.barbersControllerGetBarbers();
  }

  public async barbersControllerCreateBarber(barberData: CreateBarberDto) {
    return await BarbersService.barbersControllerCreateBarber(barberData);
  }

  public async barbersControllerGetBarberDetails(id: string) {
    return await BarbersService.barbersControllerGetBarberDetails(id);
  }

  public async barbersControllerUpdateBarber(
    id: string,
    barberData: UpdateBarberDto,
  ) {
    return await BarbersService.barbersControllerUpdateBarber(id, barberData);
  }

  public async barbersControllerDeleteBarber(id: string) {
    return await BarbersService.barbersControllerDeleteBarber(id);
  }
}
