import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, addresses: [] });
    }

    const user = await User.findById(userId);
    return NextResponse.json({
      success: true,
      addresses: user ? user.addresses || [] : [],
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to fetch addresses.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, fullName, phone, addressLine1, addressLine2, city, postcode, country, isDefault } = await request.json();

    if (!userId || !fullName || !phone || !addressLine1 || !city || !postcode) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required address fields.', error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found. Please log in again.', error: 'User not found.' },
        { status: 404 }
      );
    }

    let existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];

    // If setting as default, unset other defaults
    if (isDefault) {
      existingAddresses = existingAddresses.map((addr) => ({
        ...addr.toObject ? addr.toObject() : addr,
        isDefault: false,
      }));
    }

    const newAddress = {
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      postcode,
      country: country || 'United Kingdom',
      isDefault: isDefault || existingAddresses.length === 0,
    };

    existingAddresses.push(newAddress);

    // Direct atomic MongoDB persistence
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { addresses: existingAddresses } },
      { new: true, runValidators: true }
    );

    console.log(`✅ Saved address for user ${userId}. Total addresses: ${updatedUser.addresses.length}`);

    return NextResponse.json({
      success: true,
      message: 'Delivery address saved successfully!',
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    console.error('Error saving address:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to save address. Please check your details and try again.', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const addressId = searchParams.get('addressId');

    if (!userId || !addressId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Address ID are required.', error: 'Missing parameters.' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found.', error: 'User not found.' },
        { status: 404 }
      );
    }

    const existingAddresses = (Array.isArray(user.addresses) ? user.addresses : []).filter(
      (addr) => addr._id && addr._id.toString() !== addressId
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { addresses: existingAddresses } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully!',
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to delete address.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const { userId, addressId } = await request.json();

    if (!userId || !addressId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Address ID are required.', error: 'Missing parameters.' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found.', error: 'User not found.' },
        { status: 404 }
      );
    }

    const existingAddresses = (Array.isArray(user.addresses) ? user.addresses : []).map((addr) => {
      const obj = addr.toObject ? addr.toObject() : addr;
      return {
        ...obj,
        isDefault: obj._id && obj._id.toString() === addressId,
      };
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { addresses: existingAddresses } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Default delivery address updated!',
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    console.error('Error updating default address:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to update default address.', error: error.message },
      { status: 500 }
    );
  }
}
