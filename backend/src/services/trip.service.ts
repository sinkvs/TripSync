import { PrismaClient } from "@prisma/client"

// Экземпляр PrismaClient для работы с БД
const prisma = new PrismaClient();

// Возвращаем список поездок пользователю userId
export const getTripsByUser = async (userId: number, status?: string) => {
    const where: any = { /*userId*/ };
    if (status) where.status = status; // фильтр по статусу

    return prisma.trip.findMany({
        where,
        orderBy: { startDate: "asc" }, // сортируем по возрастанию даты начала
    });
};

// Находим одну поездку по id, при условии что она принадлежит указанному пользователю
export const getTripById = async (tripId: number, userId: number) => {
    return prisma.trip.findFirst({
        where: { id: tripId }, //, userId },
    });
};

// Создаем новую поездку, статус которой автоматически устанавливается в active
export const createTrip = async (
    userId: number,
    data: { title: string; startDate: Date; endDate: Date }
) => {
    return prisma.trip.create({
        data: {
            ...data,
            userId,
            status: "active",
        },
    });
};

// Обновляем существующую поездку (название/статус/даты). Это может сделать только владелец
export const updateTrip = async (
    tripId: number,
    userId: number,
    data: Partial<{ title: string; status: string; startDate: Date; endDate: Date }>
) => {
    const existing = await getTripById(tripId, userId);
    if(!existing)
        return null;
    return prisma.trip.update({
        where: { id: tripId },
        data,
    });
};

// Удаляем поездку (также может сделать только владелец)
export const deleteTrip = async (tripId: number, userId: number) => {
    const existing = await getTripById(tripId, userId);
    if(!existing)
        return null;
    return await prisma.$transaction(async (tx) => {
        await tx.message.deleteMany({ where: { tripId } });
        await tx.event.deleteMany({ where: { tripId } });
        await tx.document.deleteMany({ where: { tripId } });
        return await tx.trip.delete({ where: {id: tripId} });
    });
}
