import { NextRequest, NextResponse } from 'next/server';
import Team from '@/models/teams';
import connect from '@/lib/data';

// GET - Get team by ID
export async function GET(
  request: NextRequest,
) {
  try 
  {
    await connect();
    const id=request.headers.get('id');
    const team = await Team.findById(id);

    
    if (!team) {
      return NextResponse.json({
        success: false,
        error: 'Team not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: team
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch team'
    }, { status: 500 });
  }
}

// PUT - Update team by ID
export async function PATCH(
  request: NextRequest,
) {
  try {
    await connect();
    const id =request.headers.get('id');
    const body = await request.json();
    const team = await Team.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!team) {
      return NextResponse.json({
        success: false,
        error: 'Team not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: team
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error:  'Failed to update team'
    }, { status: 400 });
  }
}

// DELETE - Delete team by ID
export async function DELETE(
  request: NextRequest,
) {
  try {
    await connect();
    const id = request.headers.get('id');
    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return NextResponse.json({
        success: false,
        error: 'Team not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Failed to delete team'
    }, { status: 500 });
  }
}
