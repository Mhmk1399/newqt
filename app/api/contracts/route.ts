import { NextRequest, NextResponse } from 'next/server';
import Contract from '@/models/customersData/contracts';
import connect from '@/lib/data';

// GET - Get all contracts
export async function GET() {
  try {
    await connect();
    const contracts = await Contract.find({});
    return NextResponse.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contracts'+error
    }, { status: 500 });
  }
}

// POST - Create new contract
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const contract = new Contract(body);
    await contract.save();
    
    return NextResponse.json({
      success: true,
      data: contract
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create contract'
    }, { status: 400 });
  }
}
